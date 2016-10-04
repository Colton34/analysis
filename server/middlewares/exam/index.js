/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-04 11:02:19
*/

'use strict';

var _ = require('lodash');
var co = require('co');
var when = require('when');
var moment = require('moment');
require('moment/locale/zh-cn');
var errors = require('common-errors');

var client = require('request');

var examUitls = require('./util');
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

exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    req.checkQuery('grade', '无效的grade').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if (req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));

    next();
}

exports.initExam = function(req, res, next) {
    var grade = decodeURI(req.query.grade);
    examUitls.generateExamInfo(req.query.examid, grade, req.user.schoolId, req.user.auth.isLianKaoManager).then(function(exam) {
        req.exam = exam;
        next();
    }).catch(function(err) {
        next(err);
    });
}

exports.dashboard = function(req, res, next) {
    var exam = req.exam, result = {};
    examUitls.generateDashboardInfo(exam).then(function(dashboardInfo) {
        var examScoreArr = dashboardInfo.studentsTotalInfo;
        var allStudentsPaperInfo = dashboardInfo.allStudentsPaperInfo;

        var examScoreMap = _.groupBy(examScoreArr, 'class');
        var realClasses = _.keys(examScoreMap);

        var auth = req.user.auth;
        var gradeAuth = auth.gradeAuth;

        try {
            var examInfoGuideResult = examInfoGuide(exam, realClasses, examScoreArr.length);
            var scoreRankResult = scoreRank(examScoreArr);
            result.examInfoGuide = examInfoGuideResult, result.scoreRank = scoreRankResult;
            if(auth.isLianKaoManager) {
                var liankaoReportResult = liankaoReport(exam, examScoreArr);
                result.liankaoReport = liankaoReportResult;
            } else {
                var authSubjects = getAuthSubjectsInfo(auth, exam, examScoreArr, allStudentsPaperInfo);
                var authClasses = getAuthClasses(auth, exam.grade);

                examScoreMap = getAuthScoreMap(examScoreMap, authClasses);
                examScoreArr = getAuthScoreArr(examScoreArr, authClasses);

                var ifShowSchoolReport = ifAtLeastGradeManager(auth, gradeAuth, exam);
                var ifShowSubjectReport = (authSubjects.length > 0);
                var ifShowClassReport = ifAtLeastGroupManager(auth, gradeAuth, exam);

                var schoolReportResult = (ifShowSchoolReport) ? schoolReport(exam, examScoreArr) : null;
                var subjectReportResult = (ifShowSubjectReport) ? authSubjects : null; //TODO：补充联考权限。联考学科报告有，只不过名字不一样而已吧。。。
                var classReportResult = (ifShowClassReport) ? classReport(exam, examScoreArr, examScoreMap) : null;

                result.schoolReport = schoolReportResult, result.subjectReport = subjectReportResult, result.classReport = classReportResult;
            }
            res.status(200).json(result);
        } catch (e) {
            next(new errors.Error('format dashboard error : ', e));
        }
    }).catch(function(err) {
        next(err);
    });
}


function getAuthSubjectsInfo(auth, exam, examScoreArr, allStudentsPaperInfo) {
    var result = [], subjectMeanRates = [], gradeKey = exam.grade.name;
    var totalScoreMeanRate = _.round(_.divide(_.mean(_.map(examScoreArr, (obj) => obj.score)), exam.fullMark), 2);

    subjectMeanRates = _.map(allStudentsPaperInfo, (obj, index) => {
        return {
            subject: obj.subject,
            meanRate: _.round(_.divide(_.mean(_.map(obj.students, (obj) => obj.score)), obj.manfen), 2)
        }
    });
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

function getLianKaoReportAuth(auth, exam) {
    return exam.from == '20' && !!auth.isSchoolManager;
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

//当如果是liankao的话，把【学校】当做【班级】处理
exports.rankReport = function(req, res, next) {
    var grade = decodeURI(req.query.grade);
    var auth = req.user.auth;
    getExamWithGradePapers(req.query.examid, grade).then(function(result) {
        var papers = result.papers, examName = result.examName;
        var rankCache = getOriginalRankCache(papers, req.user.auth.isLianKaoManager);
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

function getOriginalRankCache(papers, isLianKao) {
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
        rankCache[paperId] = (isLianKao) ? _.groupBy(studentsScoreItemArr, 'school') : _.groupBy(studentsScoreItemArr, 'class');
    });
    return rankCache;
}

function filterAuthRankCache(auth, rankCache, papers, grade) {
    var authRankCache = {}, allPaperIds = _.keys(rankCache), authClasses = [];
    //Note: 如果是校级领导或者年级主任则不需要清理--返回还是此年级的全部数据，否则需要过滤出有效的科目和班级
    if(!(auth.isLianKaoManager || auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[grade]) && auth.gradeAuth[grade]))) {
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
                    authRankCache[paperId][obj.group] = rankCache[paperId][obj.group];
                    authClasses = _.union(authClasses, [obj.group]);
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

exports.customRankReport = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

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

exports.schoolAnalysis = function(req, res, next) {
    examUitls.generateExamReportInfo(req.exam).then(function(result) {
        console.time('keys');
        req.exam.realClasses = _.keys(_.groupBy(result.examStudentsInfo, 'class'));
        console.timeEnd('keys');
        req.exam.realStudentsCount = result.examStudentsInfo.length;
        res.status(200).json({
            examInfo: req.exam,
            examStudentsInfo: result.examStudentsInfo,
            examPapersInfo: result.examPapersInfo,
            examClassesInfo: result.examClassesInfo,
            examBaseline: req.exam.baseline,
            isLianKao: req.user.auth.isLianKaoManager
        })
    }).catch(function(err) {
        next(new errors.Error('schoolAnalysis Error', err));
    })
}

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

exports.createCustomAnalysis2 = function(req, res, next) {
    if(!req.body.data) return next(new errors.HttpStatusError(400, "没有data属性数据"));
    var schoolId = req.user.schoolId;
    var customExamData = req.body.data;
    customExamData.school_id = schoolId;
    var examName = customExamData['exam_name'];
    var grade = req.body.data.papers[0].grade;
    examUitls.saveCustomExam(customExamData).then(function(examId) {
        var fetchExamId = examId + '-' + schoolId;
        return examUitls.createCustomExamInfo(fetchExamId, examName, req.user.id);
    }).then(function(fetchExamId) {
        res.status(200).json({ examId: fetchExamId, grade: grade});
    }).catch(function(err) {
        next(err);
    })
}

// exports.inValidCustomAnalysis = function(req, res, next) {
//     req.checkBody('examId', '删除自定义分析错误，无效的examId').notEmpty();
//     if(req.validationErrors()) return next(req.validationErrors());

//     peterFX.set(req.body.examId, {isValid: false}, function(err, result) {
//         if(err) return next(new errors.data.MongoDBError('更新自定义分析错误', err));
//         res.status(200).send('ok');
//     })
// }


//TODO:待完善！！！
exports.inValidCustomAnalysis2 = function(req, res, next) {

console.log('========== 2');


    req.checkBody('examId', '删除自定义分析错误，无效的examId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());


console.log('========== 2.0');


    when.promise(function(resolve, reject) {
        var postBody = {
            "id" : req.body.examId,
            "school_id" : req.user.schoolId
        };
        //TODO: Mock~需要验证！！！
        var url = "http://ct.yunxiao.com:8158/del";
        client.post(url, {body: postBody, json: true}, function(err, response, body) {
            if (err) return reject(new errors.URIError('查询analysis server(invalid exam) Error: ', err));
            if(!_.isEqual(body, 0)) return reject(new errors.Error('查询analysis server(invalid exam)错误'));
            resolve(body);
        });
    }).then(function(body) {
        //TODO: 确认是否还需要重置存储的状态位--如果获取exams列表的过程（即analysis server那边）已经对“删除”的自定义分析做过了过滤，那么就不需要在我这里再次标记了。如果没有，要么把自定义分析objectID传到前端，
        //要么先query get然后再set
        return when.promise(function(resolve, reject) {
            //先query
            //可是这些条件都是在home页都已经过滤过的（当然如果是hack user直接调用api那另说）req.body.examId是不是需要parseInt？req.user.id不需要了，应该就是int了
            peterFX.query('@CustomExamInfo', {exam_id: req.body.examId, status: 1, owner: req.user.id}, function(err, results) {
                if(err) return reject(new errors.data.MongoDBError('查找CustomExamInfo Error : ', err));
                if(!results || results.length != 1) return reject(new errors.Error('无效的customExamInfo'));
                resolve(result[0]);
            });
        });
    }).then(function(customExamInfo) {
        console.log('customExamInfo._id =============================== ', customExamInfo._id);
        return when.promise(function(resolve, reject) {
            peterFX.set(customExamInfo._id, {status: 0}, function(err, result) {
                if(err) return reject(new errors.data.MongoDBError('重置customExamInfo status Error: ', err));
                resolve(result);
            });
        });
    }).then(function() {
        res.status(200).send('ok');
    }).catch(function(err) {
        next(err);
    });
}

exports.updateExamBaseline = function(req, res, next) {
//post上来的是一个grade exam所对应的levels数据
    req.checkBody('examId', '更新grade exam levels数据错误，无效的examId').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if(!req.body.baseline) return next(new errors.HttpStatusError(400, "更新grade exam levels数据错误，无效的baseline"));

    updateBaseline(req.body.examId, req.body.baseline).then(function(msg) {
        res.status(200).send('ok');
    }).catch(function(err) {
        next(err);
    });
}

function getCustomExams(owner) {
    return when.promise(function(resolve, reject) {
// TODO(当添加自定义分析的分享功能的时候): 修改过滤条件为： {'isValid': true, $or: [{'owner': {$eq: owner}}, {$and: [{'owner': {$ne: owner}}, {isPublic: true}]}]}
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

/**
 * 对exams进行排序格式化，从而符合首页的数据展示
 * @param  {[type]} exams [description]
 * @return {[type]}       返回最终被格式化好的，有序的（不同时间戳之间有序，同一时间戳内也是有序的）exam实例
 */
function formatExams(exams) {
    var examEventTimeMap = _.groupBy(exams, function(exam) {
        var time = moment(exam["event_time"]);
        var year = time.get('year') + '';
        var month = time.get('month') + 1;
        month = (month > 9) ? (month + '') : ('0' + month);
        var key = year + '.' + month;
        return key;
    });

    //result用来保存格式化后的结果；
    //resultOrder用来对group中的不同时间戳进行排序（统一时间戳下的数组在内部排序）；
    //finalResult将result和resultOrder结合得到有序的格式化后的结果；
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
                obj.id = value.exam.fetchId;
                obj.time = moment(value.exam['event_time']).valueOf();
                obj.eventTime = moment(value.exam['event_time']).format('ll');
                if(!papers) console.log('没有papers');
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

/**
 * 对首页的examList进行Auth过滤
 * @param  {[type]} formatedExams [description]
 * @param  {[type]} auth          [description]
 * @return {[type]}               [description]
 */
function filterExamsByAuth(formatedExams, auth, uid, school) {
    //Note: 如果过滤后最终此时间戳key下没有exam了则也不显示此time key
    //Note: 从当前用户中获取此用户权限，从而过滤
    if(!auth.isLianKaoManager) {
        if(auth.isSchoolManager) return formatedExams;
        //Note: 只要是此年级的，那么都能看到这场考试，但是具体的考试的数据要跟着此用户的权限走
        var authGrades = _.keys(auth.gradeAuth);
        var result = [];
        _.each(formatedExams, (obj) => {
            var vaildExams = _.filter(obj.values, (examItem) => {
                return ((examItem.from != '20') && ((examItem.from != '40') && (_.includes(authGrades, examItem.grade))) || ((examItem.from == '40') && (examItem.owner == uid)));
            });
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

function examInfoGuide(exam, realClasses, realStudentsCount) {
    return {
        name: exam.name,
        from: exam.from,
        subjectCount: exam['[papers]'].length,
        realClassesCount: realClasses.length,
        realStudentsCount: realStudentsCount
    };
}

//TODO: 下列使用常数的部分可能都需要抽取出作为常量使用，而不是写死。
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

    var result = _.map(_.range(segments.length - 1), function(index) {
        return (groupStudentsBySegments[index]) ? groupStudentsBySegments[index].length : 0
    });

    return result;
}

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

function getAuthExamInfo(authRankCache, examName, papers) {
    var authPaperIds = _.keys(authRankCache);
    var examPapers = [];
    _.each(authPaperIds, (paperId) => {
        if(paperId == 'totalScore') return;
        var targetPaper = _.find(papers, (paperObj) => paperObj._id.toString() == paperId+"");
        examPapers.push({paper: targetPaper._id, pid: targetPaper.id, name: targetPaper.subject});
    });
    var examClasses = _.keys(authRankCache.totalScore);
    return {
        name: examName,
        papers: examPapers,
        classes: examClasses
    };
}

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


function makeExamInfo(examInfo) {
    var result = _.pick(examInfo, ['name', 'gradeName', 'startTime', 'realStudentsCount', 'lostStudentsCount', 'fullMark', 'from']);
    result.realClasses = examInfo['[realClasses]'];
    result.lostClasses = examInfo['[lostClasses]'];
    result.subjects = examInfo['[subjects]'];
    return result;
}

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

function getAuthClasses(auth, grade) {
//Note: 如果是schoolManager或者是此年级的年级主任或者是此年级某一学科的学科组长，那么都是给出全部此年级的班级。否则就要判断具体管理的是那些班级
    var allClasses = _.map(grade['[classes]'], (obj) => obj.name);
    if(auth.isSchoolManager) return allClasses;
    if(_.isBoolean(auth.gradeAuth[grade.name]) && auth.gradeAuth[grade.name]) return allClasses;
    if(_.isObject(auth.gradeAuth[grade.name]) && auth.gradeAuth[grade.name].subjectManagers.length > 0) return allClasses;
    var groupManagersClasses = _.map(auth.gradeAuth[grade.name].groupManagers, (obj) => obj.group);
    var subjectTeacherClasses = _.map(auth.gradeAuth[grade.name].subjectTeachers, (obj) => obj.group);
    return _.union(groupManagersClasses, subjectTeacherClasses);
}
