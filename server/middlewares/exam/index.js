/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-27 16:42:33
*/

'use strict';

var _ = require('lodash');
var when = require('when');
var moment = require('moment');
require('moment/locale/zh-cn');
var errors = require('common-errors');

var examUitls = require('./util');
var peterHFS = require('peter').getManager('hfs');
var peterFX = require('peter').getManager('fx');

/**
 * 根据当前登录的用户获取其所在学校所产生的考试
 * [home description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.home = function(req, res, next) {
    examUitls.getSchoolById(req.user.schoolId).then(function(school) {
        return examUitls.getExamsBySchool(school);
    }).then(function(originalExams) {
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
        formatedExams = filterExamsByAuth(formatedExams, req.user.auth, req.user.id);
        var errorInfo = {};
        if(req.originalExams.length == 0) errorInfo.msg = '此学校没有考试';
        if(req.originalExams.length > 0 && formatedExams.length == 0) errorInfo.msg = '您的权限下没有可查阅的考试';




        res.status(200).json({examList: formatedExams, errorInfo: errorInfo});
    }).catch(function(err) {
        next(err);
    })
}

/**
 * Dashboard需要的API。每一个key对应一个模块。
 * 当前是把所有模块的计算都放在了后端--因为这些计算本身不太复杂，并且一些数据结构都是立等可取的，不需要二次转换所以放在这里了，如果后期
 * 需要一些通用的复杂的数据结构那么有可能在global app的位置做了init，从而后面整个app runtime使其都使用这些数据结构。
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
 exports.dashboard = function(req, res, next) {
    var exam = req.exam,
        examScoreMap = req.classScoreMap,
        examScoreArr = req.orderedScoresArr;

    var auth = req.user.auth;
    var gradeAuth = auth.gradeAuth;
    var ifShowSchoolReport = (auth.isSchoolManager || (_.isBoolean(gradeAuth[exam.grade.name]) && gradeAuth[exam.grade.name]));
    try {
        var examInfoGuideResult = examInfoGuide(exam);
        var scoreRankResult = scoreRank(examScoreArr);
        var schoolReportResult = (ifShowSchoolReport) ? schoolReport(exam, examScoreArr) : null;
        // var levelScoreReportResult = levelScoreReport(exam, examScoreArr);
        // var classScoreReportResult = classScoreReport(examScoreArr, examScoreMap);

        res.status(200).json({
            examInfoGuide: examInfoGuideResult,
            scoreRank: scoreRankResult,
            schoolReport: schoolReportResult
            // levelScoreReport: levelScoreReportResult,
            // classScoreReport: classScoreReportResult
        });
    } catch (e) {
        next(new errors.Error('format dashboard error : ', e));
    }
}

/**
 * 自定义分析的Dashboard API
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
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
            // var customLevelScoreReportResult = customLevelScoreReport(exam);
            // var customClassScoreReportResult = customClassScoreReport(exam);

            res.status(200).json({
                examInfoGuide: customExamInfoGuideResult,
                scoreRank: customScoreRankResult,
                schoolReport: customSchoolReportResult
                // levelScoreReport: customLevelScoreReportResult,
                // classScoreReport: customClassScoreReportResult
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
                }
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
    generateExamStudentsInfo(exam, examScoreArr, req.examClassesInfo).then(function(examStudentsInfo) {
        res.status(200).json({
            examInfo: req.examInfo,
            examPapersInfo: req.examPapersInfo,
            examClassesInfo: req.examClassesInfo,
            examStudentsInfo: examStudentsInfo
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

    peterFX.get(req.query.examid, {isValid: true, owner: req.user.id}, function(err, exam) {
        if(err) return next(new errors.data.MongoDBError('get custom exam error: ', err));
        if(!exam) return next(new errors.data.MongoDBError('not found valid exam'));

        try {
            var examInfo = makeExamInfo(exam.info);
            var examStudentsInfo = makeExamStudentsInfo(exam['[studentsInfo]']);
            var examPapersInfo = makeExamPapersInfo(exam['[papersInfo]']);
            var examClassesInfo = makeExamClassesInfo(exam['[classesInfo]']);
            res.status(200).json({
                examInfo: examInfo,
                examStudentsInfo: examStudentsInfo,
                examPapersInfo: examPapersInfo,
                examClassesInfo: examClassesInfo
            });
        } catch(e) {
            next(new errors.Error('server format custom analysis error: ', e));
        }
    });
}

/**
 * 创建自定义分析
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.createCustomAnalysis = function(req, res, next) {
    if(!req.body.data) return next(new errors.HttpStatusError(400, "没有data属性数据"));

    var postData = req.body.data;
    postData.owner = req.user.id;

    peterFX.create('@Exam', req.body.data, function(err, result) {
        if(err) return next(new errors.data.MongoDBError('创建自定义分析错误', err));
        res.status(200).json({examId: result});
    });
}

/**
 * “删除”（不是物理删除）一个自定义分析
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.inValidCustomAnalysis = function(req, res, next) {
    req.checkBody('examId', '删除自定义分析错误，无效的examId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    peterFX.set(req.body.examId, {isValid: false}, function(err, result) {
        if(err) return next(new errors.data.MongoDBError('更新自定义分析错误', err));
        res.status(200).send('ok');
    })
}

/**
 * 对获取exam API的参数进行校验：examid 和 grade。只是做了参数的校验--因为比较common且独立所以抽取出来作为单独的middleware。
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    req.checkQuery('grade', '无效的grade').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if (req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));

    next();
}

/**
 * 初始化exam。得到的exam、orderedScoresArr、classScoreMap三个信息，为基本的examPapersInfo、examClassesInfo、examPapersInfo、examClassesInfo数据结构做准备。
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
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

/**
 * 获取当前登录用户所创建的分析--保证格式和获取阅卷的exam格式相同，从而方便下面一起被formated。
 * @param  {[type]} owner [description]
 * @return {[type]}       [description]
 */
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

/**
 * 对首页的examList进行Auth过滤
 * @param  {[type]} formatedExams [description]
 * @param  {[type]} auth          [description]
 * @return {[type]}               [description]
 */
function filterExamsByAuth(formatedExams, auth, uid) {
    //Note: 如果过滤后最终此时间戳key下没有exam了则也不显示此time key
    //Note: 从当前用户中获取此用户权限，从而过滤
    if(auth.isSchoolManager) return formatedExams;
    //Note: 只要是此年级的，那么都能看到这场考试，但是具体的考试的数据要跟着此用户的权限走
    var authGrades = _.keys(auth.gradeAuth);
    var result = [];
    _.each(formatedExams, (obj) => {
        var vaildExams = _.filter(obj.values, (examItem) => {
            //Note: 先过滤掉联考；只有自定义或者阅卷
            return (((examItem.from != '30')) && ((examItem.from != '40') && (_.includes(authGrades, examItem.grade))) || ((examItem.from == '40') && (examItem.owner == uid)));
        });
        if(vaildExams.length > 0) result.push({timeKey: obj.timeKey, values: vaildExams});
    });
    return result;
}

/**
 * 格式化输出examInfo
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
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

//TODO: 下列使用常数的部分可能都需要抽取出作为常量使用，而不是写死。
/**
 * 一般阅卷Dashboard排行榜的API--注意排列顺序
 * @param  {[type]} examScoreArr [description]
 * @return {[type]}              [description]
 */
function scoreRank(examScoreArr) {
    return {
        top: _.reverse(_.takeRight(examScoreArr, 6)),
        low: _.reverse(_.take(examScoreArr, 6))
    }
}

/**
 * 阅卷Dashboard校级报告模块
 * @param  {[type]} exam         [description]
 * @param  {[type]} examScoreArr [description]
 * @return {[type]}              [description]
 * 和校级报告详情的总分趋势的接口相同
 */
function schoolReport(exam, examScoreArr) {
    var segments = makeSegments(exam.fullMark);
    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsStudentsCount(examScoreArr, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

/**
 * 创建segments。这里count是区间段的个数，所以segments.length = count + 1(自动填充了最后的end值)
 * @param  {[type]} end   [description]
 * @param  {Number} start [description]
 * @param  {Number} count [description]
 * @return {[type]}       [description]
 */
function makeSegments(end) {
    var start = 0, count = 12;
    var step = _.ceil(_.divide(_.subtract(end, start), count));
    var result = _.range(start, end + 1, step);
    if (_.takeRight(result) < end) result.push(end);
    return result;
}

/**
 * 获取所给学生(students)在 由segments形成的总分（因为这里取得是student.score--可以扩展）区间段中 的分布（个数）
 * @param  {[type]} students [description]
 * @param  {[type]} segments [description]
 * @return 和segments形成的区间段一一对应的分布数数组
 */
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

//TODO：阅卷Dashboar暂时用不到的模块视图API
/**
 * 一般阅卷Dashboard的分档模块。按照默认的分档标准进行分档划分。Note: 注意这里是按照百分比的常量进行计算的--这样不受总分的影响。
 * @param  {[type]} exam         [description]
 * @param  {[type]} examScoreArr [description]
 * @return {[type]}              [description]
 */
// function levelScoreReport(exam, examScoreArr) {
//     var levels = {
//         0: {
//             score: 0,
//             count: 0,
//             percentage: 15
//         },
//         1: {
//             score: 0,
//             count: 0,
//             percentage: 25
//         },
//         2: {
//             score: 0,
//             count: 0,
//             percentage: 60
//         }
//     };

//     var totalStudentCount = exam.realStudentsCount;
//     _.each(levels, (levObj, levelKey) => {
//         levObj.count = _.ceil(_.multiply(_.divide(levObj.percentage, 100), totalStudentCount));
//         var targetStudent = _.takeRight(examScoreArr, levObj.count)[0];
//         levObj.score = targetStudent ? targetStudent.score : 0;
//     });
//     return levels;
// }

/**
 * 一般阅卷Dashboard的班级报告API。
 * @param  {[type]} examScoreArr [description]
 * @param  {[type]} examScoreMap [description]
 * @return {[type]}              [description]
 */
// function classScoreReport(examScoreArr, examScoreMap) {
//     var scoreMean = _.round(_.mean(_.map(examScoreArr, (scoreObj) => scoreObj.score)), 2);
//     var classesMean = _.map(examScoreMap, (classesScore, className) => {
//         return {
//             name: className,
//             mean: _.round(_.mean(_.map(classesScore, (scoreObj) => scoreObj.score)), 2)
//         }
//     });
//     var orderedClassesMean = _.sortBy(classesMean, 'mean');
//     return {
//         gradeMean: scoreMean,
//         top5ClassesMean: _.reverse(_.takeRight(orderedClassesMean, 5))
//     };
// }

/**
 * 自定义分析Dashboard总体概览模块
 * @param  {[type]} examInfo [description]
 * @return {[type]}          [description]
 */
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

/**
 * 自定义分析Dashboard排行榜模块
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
function customScoreRank(exam) {
    var examStudentsInfo = exam['[studentsInfo]'];
    return {
        top: _.reverse(_.takeRight(examStudentsInfo, 6)),
        low: _.reverse(_.take(examStudentsInfo, 6))
    }
}

/**
 * 自定义分析Dashboard校级报告模块
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
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

//TODO:自定义Dashboard暂时不用到的模块视图
/**
 * 自定义分析的Dahsboard的分档模块
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
// function customLevelScoreReport(exam) {
//     var levels = {
//         0: {
//             score: 0,
//             count: 0,
//             percentage: 15
//         },
//         1: {
//             score: 0,
//             count: 0,
//             percentage: 25
//         },
//         2: {
//             score: 0,
//             count: 0,
//             percentage: 60
//         }
//     };
//     var totalStudentCount = exam.info.realStudentsCount;
//     var examStudentsInfo = exam['[studentsInfo]'];
//     _.each(levels, (levObj, levelKey) => {
//         levObj.count = _.ceil(_.multiply(_.divide(levObj.percentage, 100), totalStudentCount));
//         var targetStudent = _.takeRight(examStudentsInfo, levObj.count)[0];
//         levObj.score =  targetStudent ? targetStudent.score : 0;
//     });
//     return levels;
// }

/**
 * 自定义分析Dashboard班级分析报告模块
 * @param  {[type]} exam [description]
 * @return {[type]}      [description]
 */
// function customClassScoreReport(exam) {
//     var examStudentsInfo = exam['[studentsInfo]'];
//     var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class');

//     var scoreMean = _.round(_.mean(_.map(examStudentsInfo, (student) => student.score)), 2);
//     var classesMean = _.map(studentsGroupByClass, (classesStudents, className) => {
//         return {
//             name: className,
//             mean: _.round(_.mean(_.map(classesStudents, (student) => student.score)), 2)
//         }
//     });
//     var orderedClassesMean = _.sortBy(classesMean, 'mean');
//     return {
//         gradeMean: scoreMean,
//         top5ClassesMean: _.reverse(_.takeRight(orderedClassesMean, 5))
//     };
// }

/**
 * 根据examid获取到一个exam。并保证此exam种所有的papers来自同一个grade。
 * @param  {[type]} examid    目标exam的id
 * @param  {[type]} gradeName  过滤条件grade value
 * @return {[type]}           {papers: <所查找的exam下的，并且同属于一个年级的，并且是paper对象>, examName: <exam name>}
 */
function getExamWithGradePapers(examid, gradeName) {
    var targetExam;
    return when.promise(function(resolve, reject) {
        peterHFS.get('@Exam.'+examid, function(err, exam) {
            if(err) return reject(new errors.data.MongoDBError('[getExamWithGradePapers] Error ', err));
            targetExam = exam;
            resolve(_.filter(exam['[papers]'], (paper) => paper.grade == gradeName));
        });
    }).then(function(validPapers) {
        var paperIds = _.map(validPapers, (paperObj) => paperObj.paper);
        var paperPromises = _.map(paperIds, (pObjId) => {
            return when.promise(function(resolve, reject) {
                peterHFS.get(pObjId, function(err, paper) {
                    if(err) return reject(new errors.data.MongoDBError('find paper error: ', err));
                    resolve(paper);
                });
            });
        });
        return when.all(paperPromises);
    }).then(function(papers) {
        return {
            papers: papers,
            examName: targetExam.name
        }
    })
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
        //过滤有效科目下的有效班级。
        _.each(gradeAuthObj.groupManagers, (obj) => {
            _.each(allPaperIds, (paperId) => {
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

//Case: 一个教初二2，4两个班级的语文老师，查看一个只考了生物一门学科的考试--能看到dashboard中排行榜总分，进入排行榜详情中能看到对应班级的总分
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
        // authRankCache.totalScore = rankCache.totalScore;
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
    var examInfo = _.pick(exam, ['name', 'realStudentsCount', 'lostStudentsCount', 'realClasses', 'lostClasses', 'fullMark']);
    examInfo.gradeName = exam.grade.name;
    examInfo.startTime = moment(exam['event_time']).valueOf();
    examInfo.subjects = _.map(exam['[papers]'], (paper) => paper.subject);
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
        var obj = _.pick(paperItem, ['id', 'paper', 'subject']);
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
 * 在examScoreArr的每个对象中添加papers属性信息: 一个数组，里面就是{id: <pid>, score: <分数>}
 * @param  {[type]} exam            [description]
 * @param  {[type]} examScoreArr    [description]
 * @param  {[type]} examClassesInfo [description]
 * @return {[type]}                 [description]
 */

function generateExamStudentsInfo(exam, examScoreArr, examClassesInfo) {
    return generateStudentsPaperInfo(exam).then(function(studentsPaperInfo) {
        //遍历examScoreArr是为了保证有序
        _.each(examScoreArr, (scoreObj) => {
            scoreObj.papers = studentsPaperInfo[scoreObj.id];
        });
        return when.resolve(examScoreArr);
    });
}


function generateStudentsPaperInfo(exam) {
    //1.通过exam['[papers]']获取到各个paper的具体实例
    //2.收集各个科目每个学生的成绩，打散组成perStudentPerPaper数组--这里好像没必要构成
    //totalScore。
    //3.构成 studentsPaperInfo
    return getPaperInstanceByExam(exam).then(function(papers) {
        var perStudentPerPaperArr = _.concat(..._.map(papers, (paper) => {
            return _.map(paper['[students]'], (student, index) => {
                // studentId: xxx, class_name: xxx, paperid: xxx, score: xxx
                //注意：student.id是个什么样的id？后面studentsPaperInfo的key是
                //student的短id
                return {id: student.id, class_name: student.class, paperid: paper.id, score: student.score};
            });
        }));
        var studentsPaperInfo = _.groupBy(perStudentPerPaperArr, 'id');
        return when.resolve(studentsPaperInfo);
    });
}

function getPaperInstanceByExam(exam) {
    var papersPromise = _.map(exam['[papers]'], (paperObj) => {
        return when.promise(function(resolve, reject) {
            peterHFS.get(paperObj.paper, function(err, paper) {
                if(err) return reject(new errors.Data.MongDBError('find paper: ' + paperId + '  Error', err));
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
    var result = _.pick(examInfo, ['name', 'gradeName', 'startTime', 'realStudentsCount', 'lostStudentsCount', 'fullMark']);
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
        var paperObj = _.pick(paperItem, ['id', 'paper', 'subject', 'fullMark', 'realStudentsCount', 'lostStudentsCount']);
        paperObj = _.assign(paperObj, { realClasses: paperItem['[realClasses]'], lostClasses: paperItem['[lostClasses]']});
        var classCountsMap = {};
        _.each(paperItem['[class]'], (classCountItem) => {
            classCountsMap[classCountItem.name] = classCountItem.count;
        });
        paperObj.class = classCountsMap;
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




//Note: (方案一) -- 性能不work
// function generateExamStudentsInfo(exam, examScoreArr, examClassesInfo) {
//     return generateStudentsPaperInfo(exam, examClassesInfo).then(function(studentsPaperInfo) {
//         //遍历examScoreArr是为了保证有序
//         _.each(examScoreArr, (scoreObj) => {
//             scoreObj.papers = studentsPaperInfo[scoreObj.id];
//         });
//         return when.resolve(examScoreArr);
//     });
// }
//如果某些班级没有参加某场paper，那么此班级里的所有学生的papers属性就会缺少对应的pid对象
 /**
  * 获取每个学生各个科目的相关考试信息
  * @param  {[type]} exam            [description]
  * @param  {[type]} examClassesInfo [description]
  * @return {[type]}
{
    <student._id>: [
        {
           paperid:
           score:
        },
        ...
    ],
    ...
}

  */
// function generateStudentsPaperInfo(exam, examClassesInfo) {
//     var studentsPaperInfo = {};
//     var targetPaperIds = _.map(exam['[papers]'], (paperItem) => paperItem.id);
//     //Note: 当前参加此场exam考试的所有学生。因为是面向所有exam，但有可能有些学生考了某科目而有些没有考，甚至会包含缺考的考生--因为
//     //走的是班级人数--但只会让这些学生的papers相应的缺少对应的paper而已。
//     var studentIds = _.map(_.concat(..._.map(exam.realClasses, (className) => examClassesInfo[className].students)), (sid) => '@Student.' + sid);
//     return when.promise(function(resolve, reject) {
//         peterHFS.getMany(studentIds, {project: ['_id', '[papers]']}, function(err, students) {
//             if(err) return reject(new errors.data.MongoDBError('query students error : ', err));
//             try {
//                 _.each(students, (studentItem) => {
//                     //Note: 必要的过滤--保证只有同属于一个年级的科目被添加进来--其他的服务接口都不能（或直接方便地）达到这个目的
//                     var targetPapers = _.filter(studentItem['[papers]'], (paperItem) => _.includes(targetPaperIds, paperItem.paperid));
//                     targetPapers = _.map(targetPapers, (paperItem) => _.pick(paperItem, ['paperid', 'score', 'class_name']));
//                     var studentId = studentItem._id.toString();
//                     studentId = studentId.slice(_.findIndex(studentId, (c) => c !== '0'));
//                     studentsPaperInfo[studentId] = targetPapers;
//                 });
//                 resolve(studentsPaperInfo);
//             } catch (e) {
//                 reject(new errors.Error('generateStudentsPaperInfo error : ', e));
//             }
//         });
//     });
// }

//===============================================================================================================

/**
 * TODO: 关于Dashboard中学生个人报告模块API
 * 怎么定义的？？？本来想是req.user--但是不对，应为当前登录应该为教师等级的。。。
 * @return {[type]} [description]
 */
// function getStudentSelfReport(examScoreArr, examScoreMap) {
//     // return { todo: '待定'};
//     // 所有学生：
//         //[{name: , score: scoolRanking: , classRanking: , subject: }, <name>]
//     var top20Students = _.reverse(_.takeRight(examScoreArr, 20));
//     var topStudent = top20Students[0];
//     var restStudents = _.slice(top20Students, 1);
//     return getStudentInfo(topStudent.id).then(function(student) {
//         //TODO: 在这里拼接第一个学生的相关数据
//     })
// }

// function getStudentInfo(studentId) {
//     return when.promise(function(resolve, reject) {
//         peterHFS.get('@Student' + studentId, function(err, student) {
//             if(err) return reject(new errors.data.MongoDBError('find single student error : ', err));
//             resolve(student);
//         });
//     });
// }
