/*
* @Author: HellMagic
* @Date:   2016-09-23 09:51:38
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-23 10:57:59
*/

'use strict';
var _ = require('lodash');
var co = require('co');
var when = require('when');
var moment = require('moment');
require('moment/locale/zh-cn');
var errors = require('common-errors');

var examUitls = require('./util');
var peterHFS = require('peter').getManager('hfs');
var peterFX = require('peter').getManager('fx');

exports.home = function(req, res, next) {
    examUitls.getExamsBySchoolId(req.user.schoolId).then(function(originalExams) {
        req.originalExams = originalExams;
        return getCustomExams(req.user.id);
    }).then(function(customExams) {
        try {
            var validExams = _.filter(_.concat(req.originalExams, customExams), (examObj) => examObj['[papers]'].length > 0);
            var formatedExams = formatExams(validExams);
            return when.resolve(formatedExams);
        } catch(e) {
            return when.reject(new errors.Error('格式化exams错误', e));
        }
    }).then(function(formatedExams) {
        formatedExams = filterExamsByAuth(formatedExams, req.user.auth, req.user.id, req.school);
        var errorInfo = {};
        if(req.originalExams.length == 0) errorInfo.msg = '此学校没有考试';
        if(req.originalExams.length > 0 && formatedExams.length == 0) errorInfo.msg = '您的权限下没有可查阅的考试';

        res.status(200).json({examList: formatedExams, errorInfo: errorInfo});//TODO:这里的error机制需要重新设计
    }).catch(function(err) {
        next(err);
    });
}

// TODO(当添加自定义分析的分享功能的时候): 修改过滤条件为： {'isValid': true, $or: [{'owner': {$eq: owner}}, {$and: [{'owner': {$ne: owner}}, {isPublic: true}]}]}
function getCustomExams(owner) {
    return when.promise(function(resolve, reject) {
        peterFX.query('@Exam', {owner: owner, 'isValid': true}, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('find my custom analysis error: ', err));
            resolve(_.map(results, (examItem) => {
                var obj = _.pick(examItem.info, ['name', 'from']);
                obj.owner = examItem.owner;
                obj._id = examItem._id;
                obj.event_time = examItem.info.startTime;
                var examPapersInfo = examItem['[papersInfo]'];
                obj['[papers]'] = _.map(examPapersInfo, (examPaperObj) => {
                    var paperObj = _.pick(examPaperObj, ['paper', 'grade', 'subject']);
                    paperObj.manfen = examPaperObj.fullMark;
                    return paperObj;
                });
                return obj;
            }));
        });
    });
}

function formatExams(exams) {
    var examEventTimeMap = _.groupBy(exams, function(exam) {
        var time = moment(exam["event_time"]);
        var year = time.get('year') + '';
        var month = time.get('month') + 1;
        month = (month > 9) ? (month + '') : ('0' + month);
        var key = year + '.' + month;
        return key;
    });

    var result = {},
        resultOrder = [];

    _.each(examEventTimeMap, function(examsItemArr, timeKey) {
        var flag = {
            key: timeKey,
            value: moment(timeKey.split('.')).valueOf()
        };
        resultOrder.push(flag);
        var temp = {};
        _.each(examsItemArr, function(exam) {
            temp[exam._id] = {
                exam: exam
            };
            var papersGradeMap = _.groupBy(exam["[papers]"], function(paper) {
                return paper.grade;
            });
            temp[exam._id].papersMap = papersGradeMap;
        });

        if (!result[timeKey]) result[timeKey] = [];

        _.each(temp, function(value, key) {
            var justOneGrade = (_.size(value.papersMap) === 1);
            _.each(value.papersMap, function(papers, gradeKey) {
                var obj = {};
                obj.examName = (justOneGrade) ? value.exam.name : value.exam.name + "(年级：" + gradeKey + ")";
                obj.examid = value.exam._id + '_' + gradeKey;
                obj.grade = gradeKey;
                obj.id = key;
                obj.time = moment(value.exam['event_time']).valueOf();
                obj.eventTime = moment(value.exam['event_time']).format('ll');
                obj.subjectCount = papers.length;
                obj.papers = _.map(papers, (obj) => {
                    return {
                        id: obj.paper,
                        subject: obj.subject
                    }
                });
                obj.fullMark = _.sum(_.map(papers, (item) => item.manfen));
                obj.from = value.exam.from;
                obj.owner = value.exam.owner;

                result[timeKey].push(obj);
            });
        });

        result[timeKey] = _.orderBy(result[timeKey], [(obj) => obj.time], ['desc']);
    });

    resultOrder = _.orderBy(resultOrder, ['value'], ['desc']);
    var finallyResult = [];
    _.each(resultOrder, function(item) {
        finallyResult.push({
            timeKey: item.key,
            values: result[item.key]
        });
    });
    return finallyResult;
}

function filterExamsByAuth(formatedExams, auth, uid, school) {
    //Note: 只要是此年级的，那么都能看到这场考试，但是具体的考试的数据要跟着此用户的权限走
    if(!auth.isLianKaoManager) {
        if(auth.isSchoolManager) return formatedExams;
        var authGrades = _.keys(auth.gradeAuth);
        var result = [];
        _.each(formatedExams, (obj) => {
            var vaildExams = _.filter(obj.values, (examItem) => {
                return ((examItem.from != '20') && ((examItem.from != '40') && (_.includes(authGrades, examItem.grade))) || ((examItem.from == '40') && (examItem.owner == uid)));
            });
            //Note: 从当前用户中获取此用户权限，从而过滤。如果过滤后最终此时间戳key下没有exam了则也不显示此time key
            if(vaildExams.length > 0) result.push({timeKey: obj.timeKey, values: vaildExams});
        });
        return result;
    } else {
        var result = [];
        _.each(formatedExams, (obj) => {
            var vaildExams = _.filter(obj.values, (examItem) => examItem.from == '20');
            if(vaildExams.length > 0) result.push({timeKey: obj.timeKey, values: vaildExams});
        });
        return result;
    }
}

exports.dashboard = function(req, res, next) {
    var exam = req.exam,
        examScoreMap = req.classScoreMap,
        examScoreArr = req.orderedScoresArr;

    var auth = req.user.auth;
    var gradeAuth = auth.gradeAuth;

    var authSubjects = getAuthSubjectsInfo(auth, exam, examScoreArr);
    var authClasses = getAuthClasses(auth, exam.grade.name, exam);

    examScoreMap = getAuthScoreMap(examScoreMap, authClasses);
    examScoreArr = getAuthScoreArr(examScoreArr, authClasses);

    var ifShowLiankaoReport = getLianKaoReportAuth(auth, gradeAuth, exam);
    var ifShowSchoolReport = ifAtLeastGradeManager(auth, gradeAuth, exam);
    var ifShowClassReport = ifAtLeastGroupManager(auth, gradeAuth, exam);
    var ifShowSubjectReport = (authSubjects.length > 0);
    try {
        var examInfoGuideResult = examInfoGuide(exam);
        var scoreRankResult = scoreRank(examScoreArr);
        var liankaoReportResult = (ifShowLiankaoReport) ? liankaoReport(exam, examScoreArr) : null;
        var schoolReportResult = (!ifShowLiankaoReport && ifShowSchoolReport) ? schoolReport(exam, examScoreArr) : null;
        var classReportResult = (!ifShowLiankaoReport && ifShowClassReport) ? classReport(exam, examScoreArr, examScoreMap) : null;//TODO Note:可是对于各个班级有可能考试的科目不同，所以这个分值没有多大参考意义！！！
        var subjectReportResult = (!ifShowLiankaoReport && ifShowSubjectReport) ? authSubjects : null; //TODO：补充联考权限。联考学科报告有，只不过名字不一样而已吧。。。
        res.status(200).json({
            examInfoGuide: examInfoGuideResult,
            scoreRank: scoreRankResult,
            liankaoReport: liankaoReportResult,
            schoolReport: schoolReportResult,
            classReport: classReportResult,
            subjectReport: subjectReportResult
        });
    } catch (e) {
        next(new errors.Error('format dashboard error : ', e));
    }
}

function getAuthSubjectsInfo(auth, exam, examScoreArr) {
    var result = [], subjectMeanRates = [], gradeKey = exam.grade.name;
    var totalScoreMeanRate = _.round(_.divide(_.mean(_.map(examScoreArr, (obj) => obj.score)), exam.fullMark), 2);

    if(exam['[papers]'] && exam['[papers]'].length > 0) {
        subjectMeanRates = _.map(exam['[papers]'], (obj) => {
            var studentsPaperScores = [];
            _.each(_.values(obj.scores), (scoresArr) => {
                studentsPaperScores = _.concat(studentsPaperScores, scoresArr);
            });
            var meanRate = _.round(_.divide(_.mean(studentsPaperScores), obj.manfen), 2);
            return {
                subject: obj.subject,
                meanRate: meanRate
            }
        });
    }

    if((auth.isSchoolManager) || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey])) {
        result.push({subject: '总分', meanRate: totalScoreMeanRate});
        result = _.concat(result, subjectMeanRates);
    } else if(auth.gradeAuth.subjectManagers && auth.gradeAuth.subjectManagers.length > 0) {
        result.push({subject: '总分', meanRate: totalScoreMeanRate});
        var authSubjects = _.map(auth.gradeAuth.subjectManagers, (obj) => obj.subject);
        var authSubjectMeanRates = _.filter(subjectMeanRates, (obj) => _.includes(authSubjects, obj.subject));
        result = _.concat(result, authSubjectMeanRates);
    }
    return result;
}

function getAuthScoreArr(examScoreArr, authClasses) {
    return _.filter(examScoreArr, (obj) => _.includes(authClasses, obj.class));
}

function getAuthScoreMap(examScoreMap, authClasses) {
    return _.pick(examScoreMap, authClasses);
}

function ifAtLeastGradeManager(auth, gradeAuth, exam) {
    return (auth.isSchoolManager || (_.isBoolean(gradeAuth[exam.grade.name]) && gradeAuth[exam.grade.name]));
}

//TODO:联考权限
function getLianKaoReportAuth(auth, gradeAuth, exam) {
    return auth.isLianKaoManager;
    // return exam.from == '20' && !!auth.isSchoolManager; -- TODO：【暂时】因为联考报告只有【联考总体】报告所以只限制【教育局管理员】的角色能看到，有了【联考校内】报告后就是这个权限判断了
}

function ifAtLeastGroupManager(auth, gradeAuth, exam) {
    return (ifAtLeastGradeManager(auth, gradeAuth, exam)) || (gradeAuth[exam.grade.name].groupManagers && gradeAuth[exam.grade.name].groupManagers.length > 0);
}

exports.customDashboard = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    peterFX.get(req.query.examid, {isValid: true, owner: req.user.id}, function(err, exam) {
        if(err) return next(new errors.data.MongoDBError('get custom exam error: ', err));
        if(!exam) return next(new errors.data.MongoDBError('not found valid exam'));

        try {
            var customExamInfoGuideResult = customExamInfoGuide(exam.info);
            var customScoreRankResult = customScoreRank(exam);
            var customSchoolReportResult = customExamSchoolReport(exam);
            var customClassReportResult = customClassReport(exam);
            var customSubjectReportResult = customSubjectReport(exam);

            res.status(200).json({
                examInfoGuide: customExamInfoGuideResult,
                scoreRank: customScoreRankResult,
                schoolReport: customSchoolReportResult,
                classReport: customClassReportResult,
                subjectReport: customSubjectReportResult
            })
        } catch(e) {
            next(new errors.Error('format custom dashboard error: ', e));
        }
    })
}

/**
 * 分数排行榜Module的API
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}
     {
          examInfo: {
            name: ,
            papers: [{pid: , paper: , subject: }]   , //注意要在这里添加 totalScore的信息
            classes:
        }

        rankCache: {
            totalScore: {
                <className>: [ //已经是有序的（升序）
                    {
                        kaohao: ,
                        name: ,
                        class: ,
                        //score:
                    }
                ],
                ...
            },
            <pid>: {
                <className>: [
                    {
                        kaohao: ,
                        name: ,
                        class: ,
                        score
                    }
                ],
                ...
            },
            ...
        }
    }
 */
exports.rankReport = function(req, res, next) {
    var grade = decodeURI(req.query.grade);
    var auth = req.user.auth;
    getExamWithGradePapers(req.query.examid, grade).then(function(result) {
        var papers = result.papers, examName = result.examName;
        var rankCache = getOriginalRankCache(papers);
        var authRankCache = filterAuthRankCache(auth, rankCache, papers, grade);
        var examInfo = getAuthExamInfo(authRankCache, examName, papers);
        res.status(200).json({
            examInfo: examInfo,
            rankCache: authRankCache
        });
    }).catch(function(err) {
        next(err);
    })
}

/**
 * 自定义分析排行榜报告API
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        返回接口同非自定义分析的接口
 */
exports.customRankReport = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    //TODO: 测试
    peterFX.get(req.query.examid, {isValid: true, owner: req.user.id }, function(err, exam) {
        if(err) return next(new errors.data.MongoDBError('get custom exam error: ', err));
        if(!exam) return next(new errors.data.MongoDBError('not found valid exam'));
        try {
            var examStudentsInfo = exam['[studentsInfo]'], examPapersInfo = _.keyBy(exam['[papersInfo]'], 'id');
            if(!examStudentsInfo || examStudentsInfo.length == 0 || !examPapersInfo || examPapersInfo.length == 0) {
                return next(new errors.Error('no valid custom exam be found'));
            }
            var studentScoresArr = _.concat(..._.map(examStudentsInfo, (student) => {
                var obj = _.pick(student, ['id', 'kaohao', 'name', 'class']);
                var totalObj = _.assign({score: student.score, paper: 'totalScore', pid: 'totalScore'}, obj);

                var paperObjs = _.map(student['[papers]'], (pObj) => {
                    return _.assign({score: pObj.score, paper: examPapersInfo[pObj.paperid].paper, pid: pObj.paperid}, obj);
                });
                return _.concat([totalObj], paperObjs);
            }));

            var studentScoresPaperMap = _.groupBy(studentScoresArr, 'paper');
            var rankCache = {};
            _.each(studentScoresPaperMap, (studentScoresArrItem, paperObjectId) => {
                rankCache[paperObjectId] = _.groupBy(studentScoresArrItem, 'class');
            });

            var examPapers = _.map(examPapersInfo, (value, pid) => {
                return {
                    pid: value.id, paper: value.paper, name: value.subject
                }
            });
            var examInfo = {
                name: exam.info.name,
                papers: examPapers,
                classes: exam.info['[realClasses]']
            };
            res.status(200).json({
                examInfo: examInfo,
                rankCache: rankCache
            });
        } catch(e) {
            next(new errors.Error('format custom dashboard error: ', e));
        }
    })
}

/**
 * 阅卷校级报告详情API：
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}  返回examInfo、examPapersInfo、examClassesInfo、examStudentsInfo四大数据结构
/*

    examInfo:
        {
            name:
            gradeName:
            startTime:
            realClasses:
            lostClasses:
            realStudentsCount:
            lostStudentsCount:
            subjects:
            fullMark:
        }

    examStudentsInfo
        [
            {
                id:
                name:
                class:
                score:
                papers: [
                    {paperid: , score: }  Note: paperid是String id
                ],
                questionScores: [
                    {paperid: , scores: [], answers: []}
                ]
            },
            ...
        ]

    examPapersInfo
        {
            <pid>: { //Note: 这里pid也是String id
                id:
                paper:
                subject:
                fullMark:
                realClasses:
                lostClasses:
                realStudentsCount:
                lostStudentsCount:
                class: {
                    <className>: <此科目此班级参加考试的人数>
                },
                questions: []
            },
            ...
        }

    examClassesInfo
        {
            <className>: {
                name:
                students:
                realStudentsCount:
                losstStudentsCount:
            }
        }
 */
exports.schoolAnalysis = function(req, res, next) {
    var exam = req.exam,
        examScoreMap = req.classScoreMap,
        examScoreArr = req.orderedScoresArr;
    try {
        req.examInfo = formatExamInfo(exam);
        req.examPapersInfo = generateExamPapersInfo(exam);
        req.examClassesInfo = genearteExamClassInfo(exam);
    } catch (e) {
        next(new errors.Error('schoolAnalysis 同步错误', e));
    }
    generateExamStudentsInfo(exam, examScoreArr, req.examClassesInfo, req.examPapersInfo).then(function(examStudentsInfo) {
        res.status(200).json({
            examInfo: req.examInfo,
            examPapersInfo: req.examPapersInfo,
            examClassesInfo: req.examClassesInfo,
            examStudentsInfo: examStudentsInfo,
            examBaseline: req.exam.baseline
        });
    }).catch(function(err) {
        next(new errors.Error('schoolAnalysis Error', err));
    });
}

/**
 * 自定义分析校级报告详情API：
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        接口同阅卷校级报告详情API
 */
exports.customSchoolAnalysis = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    when.promise(function(resolve, reject) {
        peterFX.get(req.query.examid, {isValid: true, owner: req.user.id}, function(err, exam) {
            if(err) return reject(new errors.data.MongoDBError('get custom exam error: ', err));
            if(!exam) return reject(new errors.data.MongoDBError('not found valid exam'));

            try {
                var examInfo = makeExamInfo(exam.info);
                var examStudentsInfo = makeExamStudentsInfo(exam['[studentsInfo]']);
                var examPapersInfo = makeExamPapersInfo(exam['[papersInfo]']);
                var examClassesInfo = makeExamClassesInfo(exam['[classesInfo]']);
                // res.status(200).json();
                resolve({
                    examInfo: examInfo,
                    examStudentsInfo: examStudentsInfo,
                    examPapersInfo: examPapersInfo,
                    examClassesInfo: examClassesInfo
                });
            } catch(e) {
                reject(new errors.Error('server format custom analysis error: ', e));
            }
        });
    }).then(function(result) {
        req.result = result;
        return examUitls.getGradeExamBaseline(req.query.examid);//自定义分析肯定只有一个年级，所以可以不添加grade query condition。
    }).then(function(baseline) {
        // examBaseline: req.exam.baseline
        req.result.examBaseline = baseline;
        res.status(200).json(req.result);
    }).catch(function(err) {
        next(err);
    });
}

exports.createCustomAnalysis = function(req, res, next) {
    if(!req.body.data) return next(new errors.HttpStatusError(400, "没有data属性数据"));

    var postData = req.body.data;
    postData.owner = req.user.id;

    peterFX.create('@Exam', req.body.data, function(err, result) {
        if(err) return next(new errors.data.MongoDBError('创建自定义分析错误', err));
        res.status(200).json({examId: result});
    });
}

exports.inValidCustomAnalysis = function(req, res, next) {
    req.checkBody('examId', '删除自定义分析错误，无效的examId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    peterFX.set(req.body.examId, {isValid: false}, function(err, result) {
        if(err) return next(new errors.data.MongoDBError('更新自定义分析错误', err));
        res.status(200).send('ok');
    })
}

exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    req.checkQuery('grade', '无效的grade').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if (req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));

    next();
}


exports.initExam = function(req, res, next) {
    var grade = decodeURI(req.query.grade);
    examUitls.generateExamInfo(req.query.examid, grade, req.user.schoolId).then(function(exam) {
        req.exam = exam;
        return examUitls.generateExamScoresInfo(req.exam, req.user.auth);
    }).then(function(result) {
        req = _.assign(req, result);
        next();
    }).catch(function(err) {
        next(err);
    });
}

exports.updateExamBaseline = function(req, res, next) {
//post上来的是一个grade exam所对应的levels数据
    req.checkBody('examId', '更新grade exam levels数据错误，无效的examId').notEmpty();
    // req.checkBody('baseline', '更新grade exam levels数据错误，无效的baseline').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if(!req.body.baseline) return next(new errors.HttpStatusError(400, "更新grade exam levels数据错误，无效的baseline"));

    updateBaseline(req.body.examId, req.body.baseline).then(function(msg) {
        res.status(200).send('ok');
    }).catch(function(err) {
        next(err);
    });
}


function examInfoGuide(exam) {
    return {
        name: exam.name,
        from: exam.from,
        subjectCount: exam['[papers]'].length,
        realClassesCount: exam.realClasses.length,
        realStudentsCount: exam.realStudentsCount,
        lostStudentsCount: exam.lostStudentsCount
    };
}

function scoreRank(examScoreArr) {
    return {
        top: _.reverse(_.takeRight(examScoreArr, 6)),
        low: _.reverse(_.take(examScoreArr, 6))
    }
}


function schoolReport(exam, examScoreArr) {
    var segments = makeSegments(exam.fullMark);
    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsStudentsCount(examScoreArr, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function liankaoReport(exam, examScoreArr) {
    var segments = makeSegments(exam.fullMark);
    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsStudentsCount(examScoreArr, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function makeSegments(end) {
    var start = 0, count = 12;
    var step = _.ceil(_.divide(_.subtract(end, start), count));
    var result = _.range(start, end + 1, step);
    if (_.takeRight(result) < end) result.push(end);
    return result;
}

function makeSegmentsStudentsCount(students, segments) {
    var groupStudentsBySegments = _.groupBy(students, function(item) {
        return findScoreSegmentIndex(segments, item.score);
    });

    //(_.range(segments-1))来保证肯定生成与区间段数目（segments.length-1--即横轴或Table的一行）相同的个数，没有则填充0，这样才能对齐
    //这里已经将 levelKey = -1 和 levelKey = segments.length-1 给过滤掉了
    var result = _.map(_.range(segments.length - 1), function(index) {
        return (groupStudentsBySegments[index]) ? groupStudentsBySegments[index].length : 0
    });

    return result;
}


/*
Note: 注意这里有可能返回-1（比最小值还要小）和(segments.legnth-1)（比最大值还大）。[0~segment.length-2]是正确的值
 */
function findScoreSegmentIndex(segments, des) {
    var low = 0,
        high = segments.length - 1;
    while (low <= high) {
        var middle = _.ceil((low + high) / 2);
        if (des == segments[middle]) {
            return (des == segments[0]) ? middle : middle - 1;
        } else if (des < segments[middle]) {
            high = middle - 1;　　
        } else {
            low = middle + 1;
        }
    }
    return high; //取high是受segments的内容影响的
}

function classReport(exam, examScoreArr, examScoreMap) {
    var scoreMean = _.round(_.mean(_.map(examScoreArr, (scoreObj) => scoreObj.score)), 2);
    var classesMean = _.map(examScoreMap, (classesScore, className) => {
        return {
            name: exam.grade.name + className + '班',
            mean: _.round(_.mean(_.map(classesScore, (scoreObj) => scoreObj.score)), 2)
        }
    });
    var orderedClassesMean = _.sortBy(classesMean, 'mean');
    return {
        gradeMean: scoreMean,
        top5ClassesMean: _.reverse(_.takeRight(orderedClassesMean, 5))
    };
}

function customExamInfoGuide(examInfo) {
    return {
        name: examInfo.name,
        from: examInfo.from,
        subjectCount: examInfo['[subjects]'].length,
        realClassesCount: examInfo['[realClasses]'].length,
        realStudentsCount: examInfo.realStudentsCount,
        lostStudentsCount: examInfo.lostStudentsCount
    }
}

function customScoreRank(exam) {
    var examStudentsInfo = exam['[studentsInfo]'];
    return {
        top: _.reverse(_.takeRight(examStudentsInfo, 6)),
        low: _.reverse(_.take(examStudentsInfo, 6))
    }
}

function customExamSchoolReport(exam) {
    var examInfo = exam.info;
    var examStudentsInfo = exam['[studentsInfo]'];

    var segments = makeSegments(examInfo.fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsStudentsCount(examStudentsInfo, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    };
}

function customClassReport(exam) {
    var examStudentsInfo = exam['[studentsInfo]'];
    var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class');

    var scoreMean = _.round(_.mean(_.map(examStudentsInfo, (student) => student.score)), 2);
    var classesMean = _.map(studentsGroupByClass, (classesStudents, className) => {
        return {
            name: exam.info.gradeName+className+'班',
            mean: _.round(_.mean(_.map(classesStudents, (student) => student.score)), 2)
        }
    });
    var orderedClassesMean = _.sortBy(classesMean, 'mean');
    return {
        gradeMean: scoreMean,
        top5ClassesMean: _.reverse(_.takeRight(orderedClassesMean, 5))
    };
}

function customSubjectReport(exam) {
    //总分meanRate和各科meanRate
    var result = [];
    var examInfo = exam.info;
    var examStudentsInfo = exam['[studentsInfo]'];
    var examPapersInfo = exam['[papersInfo]'];
    var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student['[papers]'])), 'paperid');

    var totalScoreMeanRate = _.round(_.divide(_.mean(_.map(examStudentsInfo, (obj) => obj.score)), examInfo.fullMark), 2);
    result.push({subject: '总分', meanRate: totalScoreMeanRate});
    _.each(allStudentsPaperMap, (students, pid) => {
        var targetPaper = _.find(examPapersInfo, (obj) => obj.id == pid);
        if(!targetPaper) return;
        var meanRate = _.round(_.divide(_.mean(_.map(students, (obj) => obj.score)), targetPaper.fullMark), 2);
        result.push({
            subject: targetPaper.subject,
            meanRate: meanRate
        });
    });
    return result;
}

function getExamWithGradePapers(examid, gradeName) {
    var examName;
    return examUitls.getExamById(examid).then(function(exam) {
        examName = exam.name;
        var validPapers = _.filter(exam['[papers]'], (paper) => paper.grade == gradeName);
        var paperIds = _.map(validPapers, (paperObj) => paperObj.paper);
        var paperPromises = _.map(paperIds, (pObjId) => examUitls.getPaperById(pObjId));
        return when.all(paperPromises);
    }).then(function(papers) {
        return {
            papers: papers,
            examName: examName
        }
    });
}

/**
 * 获取普通全量的rankCache
 * @param  {[type]} papers [description]
 * @return {[type]}       rankCache--以每一个paper.ObjectId为key，value是一个Object--以每个班级className为key，value是某科目，某班级的学生分数数据数组
 */
function getOriginalRankCache(papers) {
    var perStudentPerPaperArr = _.concat(..._.map(papers, (paper) => {
        var scoreMatrix = paper.matrix;
        return _.map(paper['[students]'], (student, index) => {
            var paperScore = _.sum(scoreMatrix[index]);
            return _.assign({score: paperScore, paper: paper._id, pid: paper.id }, student);
        });
    }));
    var paperStudentMap = _.groupBy(perStudentPerPaperArr, 'id');
    var perStudentTotalScoreArr = _.map(paperStudentMap, (studentPapersArr, studentId) => {
        var totalScore = _.sum(_.map(studentPapersArr, (s) => s.score));
        var studentBaseInfo = _.pick(studentPapersArr[0], ['id', 'kaohao', 'name', 'class', 'school', 'xuehao']);
        return _.assign({score: totalScore, paper: 'totalScore', id: 'totalScore'}, studentBaseInfo);
    });

    var studentScoresArr = _.concat(perStudentPerPaperArr, perStudentTotalScoreArr);
    var studentScoresPaperMap = _.groupBy(studentScoresArr, 'paper');
    var rankCache = {};
    _.each(studentScoresPaperMap, (studentsScoreItemArr, paperId) => {
        rankCache[paperId] = _.groupBy(studentsScoreItemArr, 'class');
    });
    return rankCache;
}

/**
 * 根据rankCache获取匹配此用户权限的对应数据
 * @param  {[type]} auth      [description]
 * @param  {[type]} rankCache [description]
 * @return {[type]}           [description]
 */
//Test Case: 2、4班的语文老师，2班的班主任；语文科目下有2、4班；其他科目下面只有2班
function filterAuthRankCache(auth, rankCache, papers, grade) {
    var authRankCache = {}, allPaperIds = _.keys(rankCache), authClasses = [];
    //Note: 如果是校级领导或者年级主任则不需要清理--返回还是此年级的全部数据，否则需要过滤出有效的科目和班级
    if(!(auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[grade]) && auth.gradeAuth[grade]))) {
        var gradeAuthObj = auth.gradeAuth[grade];
        //Note: 过滤有效科目
        _.each(gradeAuthObj.subjectManagers, (obj) => {
            var targetAuthPaper = _.find(papers, (paperObj) => paperObj.subject == obj.subject);
            if(targetAuthPaper) {
                authRankCache[targetAuthPaper.id] = rankCache[targetAuthPaper.id];
            }
        });
        //Note: 过滤有效科目下的有效班级。
        _.each(gradeAuthObj.groupManagers, (obj) => {
            _.each(allPaperIds, (paperId) => {
                if(paperId == 'totalScore') return;
                //要么是上面学科组长已经把当前学科所需要的所有classes已经添加进来了，要么是个空数组--之前还没有遇到某一学科
                var authExistClasses = (authRankCache[paperId]) ? _.keys(authRankCache[paperId]) : [];
                authClasses = _.union(authClasses, authExistClasses);
                //Note: 如果当前authExistClasses还没有添加此班级的数据，并且此班级是有效的（即在原来的数据中能找到），则添加对应的班级数据到authRankCache中
                if(!_.includes(authExistClasses, obj.group) && (_.includes(_.keys(rankCache[paperId]), obj.group))) {
                    if(!authRankCache[paperId]) authRankCache[paperId] = {};
                    // if(!authRankCache.totalScore) authRankCache.totalScore = {};
                    authRankCache[paperId][obj.group] = rankCache[paperId][obj.group];
                    authClasses = _.union(authClasses, [obj.group]);
                    // authRankCache.totalScore[obj.group] = rankCache.totalScore[obj.group];
                }
            });
        });
        //Note: 因为auth中已经做了冗余的排查，所以如果这里有subjectTeachers那么就一定是前面所没有包含的

        //Test Case: 一个教初二2，4两个班级的语文老师，查看一个只考了生物一门学科的考试--能看到dashboard中排行榜总分，进入排行榜详情中能看到对应班级的总分
        //5班的班主任，此考试只有4班考试的生物
        _.each(gradeAuthObj.subjectTeachers, (obj) => {
            var targetAuthPaper = _.find(papers, (paperObj) => paperObj.subject == obj.subject);
            authClasses = _.union(authClasses, [obj.group]);//Note: 无论是不是当前所考试科目的任课考试，他都能看到所对应班级的总分--authClasses是为了totalScore的数据结构
            if(targetAuthPaper) {
                if(!authRankCache[targetAuthPaper._id]) authRankCache[targetAuthPaper._id] = {};
                authRankCache[targetAuthPaper._id][obj.group] = rankCache[targetAuthPaper._id][obj.group];
            }
        });
    } else {
        authRankCache = rankCache;
    }

    if(!authRankCache.totalScore) {
        //Note: 如果没有totalScore，则添加进来，但是也有走过滤班级
        // authClasses = _.uniq(authClasses); -- Note: 没必要，因为前面使用的union
        authRankCache.totalScore = {};
        _.each(authClasses, (className) => {
            authRankCache.totalScore[className] = rankCache.totalScore[className];
        })
    }
    return authRankCache;
}

/**
 * 根据authRankCache组织examInfo的信息
 * @param  {[type]} authRankCache [description]
 * @param  {[type]} examName      [description]
 * @return {[type]}               {name: xxx, papers: xxx, classes: xxx}
 */
function getAuthExamInfo(authRankCache, examName, papers) {
    var authPaperIds = _.keys(authRankCache);
    var examPapers = [];
    _.each(authPaperIds, (paperId) => {
        if(paperId == 'totalScore') return;
        var targetPaper = _.find(papers, (paperObj) => paperObj._id.toString() == paperId+"");
        examPapers.push({paper: targetPaper._id, pid: targetPaper.id, name: targetPaper.subject});
    });
    var examClasses = _.keys(authRankCache.totalScore);
    // var tempAuthObjs = [], examClasses = [];
    // _.each(authRankCache, (obj, pid) => {
    //     if(pid != 'totalScore') {
    //         tempAuthObjs.push(_.keys(obj));
    //     }
    // })
    // _.each(tempAuthObjs, (authArr) => {
    //     examClasses = _.concat(examClasses, authArr);
    // })
    // examClasses = _.uniq(examClasses);
    return {
        name: examName,
        papers: examPapers,
        classes: examClasses
    };
}

/**
 * 对examInfo进行字段格式化
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
function formatExamInfo(exam) {
    var examInfo = _.pick(exam, ['name', 'realStudentsCount', 'lostStudentsCount', 'realClasses', 'lostClasses', 'fullMark', 'from']);
    examInfo.gradeName = exam.grade.name;
    examInfo.startTime = moment(exam['event_time']).valueOf();
    examInfo.subjects = _.map(exam['[papers]'], (paper) => {
        if((paper.subject == '语文' || paper.subject == '数学')) {
            if(_.includes(paper.name, '理科')) return paper.subject + '(理科)';
            if(_.includes(paper.name, '文科')) return paper.subject + '(文科)';
            return paper.subject;
        } else {
            return paper.subject;
        }
    });
    return examInfo;
}

/**
 * 生成examPapersInfo
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
function generateExamPapersInfo(exam) {
    var examPapersInfo = {};
    _.each(exam['[papers]'], (paperItem) => {
        var obj = _.pick(paperItem, ['id', 'paper']);

        if((paperItem.subject == '语文' || paperItem.subject == '数学')) {
            if(_.includes(paperItem.name, '理科')) {
                obj.subject = paperItem.subject + '(理科)';
            } else if(_.includes(paperItem.name, '文科')) {
                obj.subject = paperItem.subject + '(文科)';
            } else {
                obj.subject = paperItem.subject;
            }
        } else {
            obj.subject = paperItem.subject;
        }

        obj.fullMark = paperItem.manfen;
        obj.realClasses = _.keys(paperItem.scores);
        var gradeClassNames = _.map(exam.grade['[classes]'], (classItem) => classItem.name);
        obj.lostClasses = _.difference(gradeClassNames, obj.realClasses);
        obj.realStudentsCount = _.sum(_.map(paperItem.scores, (classScores, className) => classScores.length));
        var totalClassStudentCount = _.sum(_.map(_.filter(exam.grade['[classes]'], (classItem) => _.includes(obj.realClasses, classItem.name)), (classObj) => classObj['[students]'].length));
        obj.lostStudentsCount = totalClassStudentCount - obj.realStudentsCount;
        var paperClass = {};
        _.each(paperItem.scores, (classScores, className) => {
            paperClass[className] = classScores.length;
        });
        obj.classes = paperClass;
        //Note: 这里选用id而不是paper是因为studentInfo中paper的成绩的id是paper.id而不是objectId
        examPapersInfo[paperItem.id] = obj;
    });

    return examPapersInfo;
}

/**
 * 生成examClassesInfo
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
function genearteExamClassInfo(exam) {
    var examClassesInfo = {};
    _.each(exam.grade['[classes]'], (classItem) => {
        var obj = _.pick(classItem, ['realStudentsCount', 'lostStudentsCount']);
        obj.students = classItem['[students]'];
        obj.name = classItem.name;
        examClassesInfo[classItem.name] = obj;
    });
    return examClassesInfo;
}

/**
 * 在examScoreArr的每个对象中添加papers属性信息: 一个数组，里面就是{id: <pid>, score: <分数>}，并且在examPapersInfo中添加paper的questions
 * @param  {[type]} exam            [description]
 * @param  {[type]} examScoreArr    [description]
 * @param  {[type]} examClassesInfo [description]
 * @return {[type]}                 [description]
 */
function generateExamStudentsInfo(exam, examScoreArr, examClassesInfo, examPapersInfo) {
    return generateStudentsPaperAndQuestionInfo(exam, examPapersInfo).then(function(result) {
        //遍历examScoreArr是为了保证有序
        var studentsPaperInfo = result.studentsPaperInfo, studentQuestionsInfo = result.studentQuestionsInfo, studentSchoolInfo = result.studentSchoolInfo;
        _.each(examScoreArr, (scoreObj) => {
            scoreObj.school = studentSchoolInfo[scoreObj.id];
            scoreObj.papers = studentsPaperInfo[scoreObj.id];
            scoreObj.questionScores = studentQuestionsInfo[scoreObj.id];
        });
        return when.resolve(examScoreArr);
    });
}


function generateStudentsPaperAndQuestionInfo(exam, examPapersInfo) {
    var studentPaperArr = [], studentQuestionMap = {}, studentSchoolInfo = {};
    return getPaperInstanceByExam(exam).then(function(papers) {
        //修改examPapersInfo中的实体--添加questions数据
        _.each(papers, (paperObj, index) => {
            examPapersInfo[paperObj.id].questions = paperObj['[questions]'];
            _.each(paperObj['[students]'], (student, index) => {
                studentPaperArr.push({id: student.id, class_name: student.class, paperid: paperObj.id, score: student.score});
                if(!studentQuestionMap[student.id]) studentQuestionMap[student.id] = [];
                studentQuestionMap[student.id].push({paperid: paperObj.id, scores: paperObj.matrix[index]}); //暂时可以先不添加： answers: paperObj.answers[index]
                studentSchoolInfo[student.id] = student.school;
            });
        });

        var studentsPaperInfo = _.groupBy(studentPaperArr, 'id');
        return when.resolve({studentsPaperInfo: studentsPaperInfo, studentQuestionsInfo: studentQuestionMap, studentSchoolInfo: studentSchoolInfo});
    });
}

function getPaperInstanceByExam(exam) {
    var papersPromise = _.map(exam['[papers]'], (paperObj) => {
        return when.promise(function(resolve, reject) {
            peterHFS.get(paperObj.paper, function(err, paper) {
                if(err) return reject(new errors.Data.MongoDBError('find paper: ' + paperId + '  Error', err));
                resolve(paper);
            });
        });
    });
    return when.all(papersPromise);
}



/**
 * 构造examInfo
 * @param  {[type]} examInfo [description]
 * @return {[type]}          [description]
 */
function makeExamInfo(examInfo) {
    var result = _.pick(examInfo, ['name', 'gradeName', 'startTime', 'realStudentsCount', 'lostStudentsCount', 'fullMark', 'from']);
    result.realClasses = examInfo['[realClasses]'];
    result.lostClasses = examInfo['[lostClasses]'];
    result.subjects = examInfo['[subjects]'];
    return result;
}

/**
 * 构造examStudentsInfo
 * @param  {[type]} examStudentsInfo [description]
 * @return {[type]}                  [description]
 */
function makeExamStudentsInfo(examStudentsInfo) {
    var result = _.map(examStudentsInfo, (studentItem) => {
        var studentObj = _.pick(studentItem, ['id', 'name', 'class', 'score', 'kaohao']);
        studentObj.papers = studentItem['[papers]'];
        var targetQuestionScores = _.map(studentItem['[questionScores]'], (obj) => {
            return {paperid: obj.paperid, scores: obj['[scores]']}
        });
        studentObj.questionScores = targetQuestionScores;//TODO:暂时没有answers
        return studentObj;
    });
    return result;
}

/**
 * 构造examPapersInfo
 * @param  {[type]} examPapersInfo [description]
 * @return {[type]}                [description]
 */
function makeExamPapersInfo(examPapersInfo) {
    var examPapersInfoArr = _.map(examPapersInfo, (paperItem) => {
        var paperObj = _.pick(paperItem, ['id', 'paper', 'subject', 'fullMark', 'realStudentsCount', 'lostStudentsCount']);//TODO Note:暂时没有对自定义分析的文理进行区分
        paperObj = _.assign(paperObj, { realClasses: paperItem['[realClasses]'], lostClasses: paperItem['[lostClasses]'], questions: paperItem['[questions]'] });
        var classCountsMap = {};
        _.each(paperItem['[class]'], (classCountItem) => {//Note: 这里就先不刷Schema了。最好修改为[classes]
            classCountsMap[classCountItem.name] = classCountItem.count;
        });
        paperObj.classes = classCountsMap;
        return paperObj;
    });
    return _.keyBy(examPapersInfoArr, 'id');
}

/**
 * 构造examClassesInfo
 * @param  {[type]} examClassesInfo [description]
 * @return {[type]}                 [description]
 */
function makeExamClassesInfo(examClassesInfo) {
    var examClassesInfoArr = _.map(examClassesInfo, (classItem) => {
        var classObj = _.pick(classItem, ['name', 'realStudentsCount', 'lostStudentsCount']);
        classObj.students = classItem['[students]'];
        return classObj;
    });
    return _.keyBy(examClassesInfoArr, 'name');
}

function updateBaseline(examId, targetBaseline) {
    return when.promise(function(resolve, reject) {
        peterFX.query('@ExamBaseline', {examid: examId, grade: targetBaseline.grade}, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('updateBaseline Mongo Error: ', err));
            resolve(results);
        });
    }).then(function(results) {
        if(results.length > 1) return reject(new errors.Error('updateBaseline Error: Exist Dirty Data'));
        if(!results || results.length == 0) return insertNewExamBaseline(examId, targetBaseline);
        return updateNewExamBaseline(results[0]._id, targetBaseline);
    });
}

function insertNewExamBaseline(examId, targetBaseline) {
    return when.promise(function(resolve, reject) {
        peterFX.create('@ExamBaseline', targetBaseline, function(err, result) {
            if(err) return reject(new errors.data.MongoDBError('insertNewExamBaseline Mongo Error: ', err));
            resolve(result);
        });
    });
}

function updateNewExamBaseline(targetObjId, newBaseline) {
    return when.promise(function(resolve, reject) {
        peterFX.set(targetObjId, newBaseline, function(err, result) {
            if(err) return reject(new errors.data.MongoDBError('updateNewExamBaseline Error: ', err));
            resolve('ok');
        });
    });
}

function getAuthClasses(auth, gradeKey, exam) {
//Note: 如果是schoolManager或者是此年级的年级主任或者是此年级某一学科的学科组长，那么都是给出全部此年级的班级。否则就要判断具体管理的是那些班级
    var allClasses = _.map(exam.grade['[classes]'], (obj) => obj.name);
    if(auth.isSchoolManager) return allClasses;
    if(_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]) return allClasses;
    if(_.isObject(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey].subjectManagers.length > 0) return allClasses;
    var groupManagersClasses = _.map(auth.gradeAuth[gradeKey].groupManagers, (obj) => obj.group);
    var subjectTeacherClasses = _.map(auth.gradeAuth[gradeKey].subjectTeachers, (obj) => obj.group);
    return _.union(groupManagersClasses, subjectTeacherClasses);
}
