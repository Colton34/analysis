/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 16:07:37
*/

//TODO: 注意联考考试是否有grade属性（需要通过query传递的）
//TODO: 注意针对文理科的设置（要把subject区分开--它们是不同的paper，不同的subject），而且基于分析的准则，最好把【文理】的标签设置在exam颗粒度上（因为一场考试总体还是只考一个性质的数学--
//文科数学或理科数学）

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
    var userAuth = req.user.auth;
    examUitls.getValidExamsBySchoolId(req.user.schoolId, req.user.id, userAuth).then(function(result) {
        var validAuthExams = result.validAuthExams, errorInfo = result.errorInfo;
        try {
            var formatedExams = formatExams(validAuthExams);
            res.status(200).json({examList: formatedExams, errorInfo: errorInfo});
        } catch(e) {
            next(new errors.Error('格式化exams错误', e));
        }
    }).catch(function(err) {
        next(err);
    });
}

function formatExams(exams) {
    var examsBaseOnGrade = getExamsBaseOnGrade(exams);
    var examFormatedTimeMap = examsGroupByFormatedTime(examsBaseOnGrade);
    var examTimeIndex = getExamTimeIndex(_.keys(examFormatedTimeMap));
    return _.map(examTimeIndex, (timeKey) => {
        var values = _.orderBy(examFormatedTimeMap[timeKey], 'timestamp');
        return {
            timeKey: timeKey,
            values: values
        }
    });
}

function getExamsBaseOnGrade(exams) {
    var result = [];
    _.each(exams, (examItem) => {
        getFormatedExam(examItem, result);
    });
    return result;
}

function getFormatedExam(exam, result) {
    var gradePapersMap = _.groupBy(exam['[papers]'], (paperItem) => paperItem.grade);
    _.each(gradePapersMap, (gradePapers, gradeKey) => {
        var obj = _.pick(exam, ['from', 'event_time']);
        obj.examName = (_.size(gradePapersMap) == 1) ? exam.name : exam.name + "(年级：" + gradeKey + ")";
        obj.grade = gradeKey;
        obj.id = exam.id;
        obj.timestamp = moment(exam['event_time']).valueOf();
        obj.formatedTime = moment(exam['event_time']).format('ll');
        obj.subjectCount = gradePapers.length;
        obj.fullMark = 0;
        obj['papers'] = _.map(gradePapers, (paperItem) => {
            obj.fullMark += paperItem.manfen;
            return {
                id: paperItem['paper'],
                subject: paperItem.subject
            }
        });
        result.push(obj);
    });
}

function examsGroupByFormatedTime(exams) {
    return _.groupBy(exams, function(exam) {
        var time = moment(exam["event_time"]);
        var year = time.get('year') + '';
        var month = time.get('month') + 1;
        month = (month > 9) ? (month + '') : ('0' + month);
        var key = year + '.' + month;
        return key;
    });
}

function getExamTimeIndex(formatedTimeKeys) {
    return _.orderBy(formatedTimeKeys, [(timeKey) => _.split(timeKey, '.')[0], (timeKey) => _.split(timeKey, '.')[1]], ['desc', 'desc']);
}


exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    req.checkQuery('grade', '无效的grade').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if (req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));

    next();
}

/*
return:
    {
        id: ,
        '[papers]': ,
        fullMark: ,
        startTime: ,
        gradeName: ,
        subjects:
        baseline: ,
        <grade>:
    }
 */
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

        // var examScoreByClass = _.groupBy(examScoreArr, 'class');
        // var realClasses = _.keys(examScoreByClass);

        var examScoreByKey = (req.user.auth.isLianKaoManager) ? _.groupBy(examScoreArr, 'school') : _.groupBy(examScoreArr, 'class');
        var realKyes = _.keys(examScoreByKey);

        var userReportAuthConfig = getUserReportAuthConfig(req.user.auth, exam.gradeName);
        try {
            result.examInfoGuide = getDashboardExamInfoGuide(exam, realKyes.length, examScoreArr.length), result.scoreRank = getDashboardScoreRank(examScoreArr);
            if(userReportAuthConfig.schoolReport) result.schoolReport = getDashboardSchoolReport(exam.fullMark, examScoreArr);
            if(userReportAuthConfig.subjectReport) result.subjectReport = getDashboradSubjectReport(userReportAuthConfig, exam.fullMark, examScoreArr, allStudentsPaperInfo);
            if(userReportAuthConfig.classReport) result.classReport = getDashboardClassReport(userReportAuthConfig, realKyes, examScoreArr, examScoreByKey, exam.gradeName);
            if(userReportAuthConfig.liankaoTotalReport) result.liankaoTotalReport = getDashboardLiankaoTotalReport(exam.fullMark, examScoreArr);
            res.status(200).json(result);
        } catch(e) {
            next(new errors.Error('format dashboard error : ', e));
        }
    }).catch(function(err) {
        next(err);
    });
}

/*
return:
    {
        studentsTotalInfo: studentsTotalInfo,
        allStudentsPaperInfo: allStudentsPaperInfo
    }
 */

function getUserReportAuthConfig(auth, gradeName) {
    var result = {}, currentGradeAuth = (auth.gradeAuth) ? auth.gradeAuth[gradeName] : undefined;
    if(auth.isLianKaoManager) {
        result.liankaoTotalReport = true;
    } else {
        if(auth.isSchoolManager || (_.isBoolean(currentGradeAuth) && currentGradeAuth)) {
            result = {schoolReport: true, subjectReport: true, classReport: true};
        } else {
            result = _.assign({}, result, currentGradeAuth);
            if(currentGradeAuth.subjectManagers.length > 0) result.subjectReport = true;
            if(currentGradeAuth.groupManagers.length > 0) result.classReport = true;
        }
    }
    return result;
}

function getDashboardExamInfoGuide(exam, realClassesCount, realStudentsCount) {
    return {
        name: exam.name,
        from: exam.from,
        subjectCount: exam['[papers]'].length,
        realClassesCount: realClassesCount,
        realStudentsCount: realStudentsCount
    };
}

function getDashboardScoreRank(examScoreArr) {
    return {
        top: _.reverse(_.takeRight(examScoreArr, 6)),
        low: _.reverse(_.take(examScoreArr, 6))
    }
}

function getDashboardSchoolReport(examFullMark, examScoreArr) {
    var segments = makeSegments(examFullMark);
    var segmentsDis = makeSegmentsDistribution(segments, examScoreArr, 'score');
    var xAxons = _.slice(segments, 1);
    var yAxons = _.map(segmentsDis, (obj) => obj.count);
    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function getDashboardLiankaoTotalReport(examFullMark, examScoreArr) {
    var segments = makeSegments(examFullMark);
    var segmentsDis = makeSegmentsDistribution(segments, examScoreArr, 'score');
    var xAxons = _.slice(segments, 1);
    var yAxons = _.map(segmentsDis, (obj) => obj.count);
    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function getDashboradSubjectReport(userReportAuthConfig, examFullMark, examScoreArr, allStudentsPaperInfo) {
    var totalScoreMeanRate = _.round(_.divide(_.mean(_.map(examScoreArr, (obj) => obj.score)), examFullMark), 2), result = [];
    var subjectMeanRates = _.map(allStudentsPaperInfo, (obj, index) => {
        return {
            subject: obj.subject,
            meanRate: _.round(_.divide(_.mean(_.map(obj.students, (obj) => obj.score)), obj.manfen), 2)
        }
    });
    if(userReportAuthConfig.schoolReport) {
        result.push({subject: '总分', meanRate: totalScoreMeanRate});
        result = _.concat(result, subjectMeanRates);
    } else if(userReportAuthConfig.subjectReport) {
        result.push({subject: '总分', meanRate: totalScoreMeanRate});
        var authSubjects = _.map(userReportAuthConfig.subjectManagers, (obj) => obj.subject);
        var authSubjectMeanRates = _.filter(subjectMeanRates, (obj) => _.includes(authSubjects, obj.subject));
        result = _.concat(result, authSubjectMeanRates);
    }
    return result;
}

function getDashboardClassReport(userReportAuthConfig, realClasses, examScoreArr, examScoreMap, gradeName) {
    var authClasses = getAuthClasses(userReportAuthConfig, realClasses);
    var gradeMean = _.round(_.mean(_.map(examScoreArr, (scoreObj) => scoreObj.score)), 2);
    var classesMean = _.chain(examScoreMap).pick(authClasses).map((classesScores, className) => {
        return {
            name: gradeName + className + '班',
            mean: _.round(_.mean(_.map(classesScores, (scoreObj) => scoreObj.score)), 2)
        }
    }).orderBy(['mean'], ['desc']).value();
    return {
        gradeMean: gradeMean,
        top5ClassesMean: _.take(classesMean, 5)
    }
}

exports.rankReport = function(req, res, next) {
    var exam = req.exam, result = {};
    examUitls.generateDashboardInfo(exam).then(function(dashboardInfo) {
        var examScoreArr = dashboardInfo.studentsTotalInfo;
        var allStudentsPaperInfo = dashboardInfo.allStudentsPaperInfo;//注意要从这里获取！！！--因为有可能auth内的班级没有参加某场考试
        var examScoreMap = (req.user.auth.isLianKaoManager) ? _.groupBy(examScoreArr, 'school') : _.groupBy(examScoreArr, 'class');
        var examScoreMapKeys = _.keys(examScoreMap);
        var authSubjectKeysInfo = getAuthSubjectKeysInfo(req.user.auth, exam.gradeName, exam['[papers]'], examScoreMapKeys);
        var authRankCache = getAuthRankCache(authSubjectKeysInfo, examScoreMap, allStudentsPaperInfo, req.user.auth.isLianKaoManager);
        var authTotalClasses = _.keys(authRankCache['totalScore']);
        var authExamInfo = getAuthExamInfo(exam.name, authTotalClasses, authSubjectKeysInfo);
        res.status(200).json({
            examInfo: authExamInfo,
            rankCache: authRankCache
        });
    }).catch(function(err) {
        next(err);
    });
}

/*

return :
    {
        <pid>: {
            keys: ,
            id: ,
            name: ,
            objectId:
        },
        ...
    }
 */
function getAuthSubjectKeysInfo(auth, gradeName, examPapers, examScoreMapKeys) {
    //虽然科目分文理，但是老师的权限的名称不会分文理。。。WTF，为什么总是用字符串进行匹配呢？？？为什么没有一个auth collection来统一管理？？？--那么一个数学老师，给他看文科数学呢还是理科数学？
    //当前只能给全部二者。。。
    var result = {}, currentGradeAuth = (auth.gradeAuth) ? auth.gradeAuth[gradeName] : undefined;
    var allSubjectNameInfo = _.map(examPapers, (obj) => {
        if(_.includes(obj.name, '文科')) return {name: `${obj.subject}(文科)`, pid: obj.id, paper: obj.paper};
        if(_.includes(obj.name, '理科')) return {name: `${obj.subject}(理科)`, pid: obj.id, paper: obj.paper};
        return {name: obj.subject, pid: obj.id, paper: obj.paper};
    });
    if(auth.isSchoolManager || (_.isBoolean(currentGradeAuth) && currentGradeAuth)) return getAllAuth(allSubjectNameInfo, examScoreMapKeys);
    _.each(currentGradeAuth.subjectManagers, (obj) => {
        _.each(allSubjectNameInfo, (subjectNameObj) => {
            if(_.includes(subjectNameObj.name, obj.subject)) result[subjectNameObj.pid] = _.assign({keys: examScoreMapKeys}, subjectNameObj);
        });
    });
    _.each(currentGradeAuth.groupManagers, (obj) => {
        _.each(allSubjectNameInfo, (subjectNameObj) => {
            if(!result[subjectNameObj.pid]) result[subjectNameObj.pid] = _.assign({keys: [obj.group]}, subjectNameObj);
            if(!_.includes(result[subjectNameObj.pid].keys, obj.group)) result[subjectNameObj.pid].keys.push(obj.group);
        });
    });
    _.each(currentGradeAuth.subjectTeachers, (obj) => {
        _.each(allSubjectNameInfo, (subjectNameObj) => {
            if(_.includes(subjectNameObj.name, obj.subject)) {
                if(!result[subjectNameObj.pid]) result[subjectNameObj.pid] = _.assign({keys: [obj.group]}, subjectNameObj);
                if(!_.includes(result[subjectNameObj.pid].keys, obj.group)) result[subjectNameObj.pid].keys.push(obj.group);
            }
        });
    });
    return result;
}

function getAllAuth(allSubjectNames, examScoreMapKeys) {
    var result = {};
    _.each(allSubjectNames, (subjectNameObj) => {
        result[subjectNameObj.pid] = _.assign({keys: examScoreMapKeys}, subjectNameObj);
    });
    return result;
}

function getAuthRankCache(authSubjectKeysInfo, examScoreMap, allStudentsPaperInfo, isLianKao) {
    var totalKeys = [];
    _.each(authSubjectKeysInfo, (subjectKeysObj, pid) => {
        totalKeys = _.union(totalKeys, subjectKeysObj.keys);
    });
    var allStudentsPaperInfoMap = _.keyBy(allStudentsPaperInfo, 'id');
    var result = {}, paperScoreMap;
    _.each(_.assign({'totalScore': {keys: totalKeys, pid: 'totalScore', paper: 'totalScore', name: '总分'}}, authSubjectKeysInfo), (subjectKeysObj, tpid) => {
        if(tpid != 'totalScore') paperScoreMap = (isLianKao) ? _.groupBy(allStudentsPaperInfoMap[tpid].students, 'school') : _.groupBy(allStudentsPaperInfoMap[tpid].students, 'class');
        result[subjectKeysObj.paper] = (tpid == 'totalScore') ? _.pick(examScoreMap, subjectKeysObj.keys) : _.pick(paperScoreMap, subjectKeysObj.keys);
    });
    return result;
}

function getAuthExamInfo(examName, authTotalClasses, authSubjectKeysInfo) {
    var authPapersInfo = _.map(authSubjectKeysInfo, (subjectKeysObj, pid) => _.pick(subjectKeysObj, ['name', 'paper', 'pid']));
    return {
        name: examName,
        papers: authPapersInfo,
        classes: authTotalClasses
    }
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

exports.createCustomAnalysis = function(req, res, next) {
    if(!req.body.data) return next(new errors.HttpStatusError(400, "没有data属性数据"));
    var schoolId = req.user.schoolId;
    var customExamData = req.body.data;
    customExamData.school_id = schoolId;
    var examName = customExamData['exam_name'];
    var grade = req.body.data.papers[0].grade;
    examUitls.saveCustomExam(customExamData).then(function(examId) {
        var fetchExamId = examId + '-' + schoolId;
        return examUitls.createCustomExamInfo(fetchExamId, req.user.schoolId, examName, grade, req.user.id);
    }).then(function(fetchExamId) {
        res.status(200).json({ examId: fetchExamId, grade: grade});
    }).catch(function(err) {
        next(err);
    });
}

exports.inValidCustomAnalysis = function(req, res, next) {
    req.checkBody('examId', '删除自定义分析错误，无效的examId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());
    examUitls.delCustomExam(req.body.examId, req.user.schoolId).then(function(body) {
        return examUitls.findCustomInfo(req.body.examId + '-' + req.user.schoolId, req.user.id);
    }).then(function(customExamInfo) {
        return examUitls.inValidCustomExamInfo(customExamInfo._id);
    }).then(function() {
        res.status(200).send('ok');
    }).catch(function(err) {
        next(err);
    });
}

exports.updateExamBaseline = function(req, res, next) {
    req.checkBody('examId', '更新grade exam levels数据错误，无效的examId').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    if(!req.body.baseline) return next(new errors.HttpStatusError(400, "更新grade exam levels数据错误，无效的baseline"));

    updateBaseline(req.body.examId, req.body.baseline).then(function(msg) {
        res.status(200).send('ok');
    }).catch(function(err) {
        next(err);
    });
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

function getAuthClasses(userReportAuthConfig, allClasses) {
    if(userReportAuthConfig.schoolReport || userReportAuthConfig.subjectReport) return allClasses;
    return _.map(userReportAuthConfig.groupManagers, (obj) => obj.group);
}

function makeSegments(end, start, step, count) {
    start = start || 0;
    count = count || 12;
    step = step || _.ceil(_.divide(_.subtract(end, start), count));
    var result = _.range(start, end + 1, step);
    if (_.last(result) < end) result.push(end);
    return result;
}


function makeSegmentsDistribution(segments, base, key) {
    var groupCountDistribution = _.groupBy(base, function(item) {
        return getSegmentIndex(segments, item[key]);
    });

    return _.map(_.range(segments.length - 1), (index) => {
        var count = (groupCountDistribution[index]) ? groupCountDistribution[index].length : 0;
        var targets = (groupCountDistribution[index]) ? groupCountDistribution[index] : [];
        return {
            index: index,
            low: segments[index],
            high: segments[index + 1],
            count: count,
            targets: targets
        }
    });
}

function getSegmentIndex(segments, target) {
    var low = 0,
        high = segments.length - 1;
    while (low <= high) {
        var middle = _.ceil((low + high) / 2);
        if (target == segments[middle]) {
            return (target == _.last(segments)) ? middle - 1 : middle;
        } else if (target < segments[middle]) {
            high = middle - 1;　　
        } else {
            low = middle + 1;
        }
    }
    return high;
}



exports.listEquivalentScoreInfo = function(req, res, next) {
    console.log('========== listEquivalentScoreInfo  =========')
    //从school exams中筛选出走班的exam，并需要这些考试的papers信息
    var zoubanExams;//analysis 一个examid的数组或者schoolId；因为后面也需要传递单个examid
/*

    examUitls.getSchoolById(req.user.schoolId).then(function(data) {
        zoubanExams = _.filter(data['[exams]'], (obj) => obj.from == '50');
        var zoubanExamPromises = _.map(zoubanExams, (obj) => examUitls.getExamById(obj['exam'], '50'));
        return when.all(zoubanExamPromises);
    }).

TODO: 接口过滤出走班考试；如果有必要则还需要对grade进行过滤
 */
    zoubanExams = [{name: "2016.10高二第二次学考模拟考", exam: '101772-10202', event_time: "2016-10-04T00:00:00.000Z", from: '50'}, {name: "2015-2016学年第二学期期末初一年级组", exam: '100532-10172', event_time: "2016-07-02T04:57:46.000Z", from: '50'}];
    zoubanExams = _.chain(zoubanExams).map((obj) => _.assign({}, obj, {timestamp: moment(obj['event_time']).valueOf()})).orderBy(['timestamp'], ['desc']).value();
    var equivalentScoreInfoPromises = _.map(zoubanExams, (obj) => examUitls.getEquivalentScoreInfoById(obj['exam']));
    when.all(equivalentScoreInfoPromises).then(function(equivalentScoreInfoList) {
        res.status(200).json(equivalentScoreInfoList);
    }).catch(function(err) {
        next(err);
    });
}

exports.setEquivalentScoreInfo = function(req, res, next) {
    if(!req.body.equivalentScoreInfo) return next(new errors.HttpStatusError(400, "没有equivalentScoreInfo属性数据"));
    //TODO: 实现存储
    var postData = req.body.equivalentScoreInfo;
    peterFX.set(postData._id, {'[lessons]': postData['[lessons]']}, function(err, result) {
        if(err) return next(new errors.data.MongoDBError('setEquivalentScoreInfo Error: ', err));
        res.status(200).json({message: 'ok'});
    });
}

exports.zoubanDS = function(req, res, next) {
//1.EquivalentScoreInfo  2.ExamStudentsInfo
//【暂时】需要打开
    // req.checkQuery('examid', '无效的examids').notEmpty();//是否还需要grade？？？
    // if (req.validationErrors()) return next(req.validationErrors());

    var result = {};
                                        //【Mock】req.query.examid
    examUitls.getEquivalentScoreInfoById('100532-10172').then(function(equivalentScoreInfo) {
        result.equivalentScoreInfo = equivalentScoreInfo;
        var paperObjectIds = _.map(equivalentScoreInfo['[lessons]'], (obj) => obj.objectId);
        return examUitls.getZoubanExamInfo(paperObjectIds);
    }).then(function(obj) {
        result.examStudentsInfo = _.sortBy(_.values(obj.examStudentsInfo), 'score');
        result.examPapersInfo = obj.examPapersInfo;
        res.status(200).json(result);
    }).catch(function(err) {
        next(err);
    });
}



// exports.listZoubanExams = function(req, res, next) {
//     //从school exams中筛选出走班的exam，并需要这些考试的papers信息
//     var zoubanExams;//analysis 一个examid的数组或者schoolId；因为后面也需要传递单个examid
// /*

//     examUitls.getSchoolById(req.user.schoolId).then(function(data) {
//         zoubanExams = _.filter(data['[exams]'], (obj) => obj.from == '50');
//         var zoubanExamPromises = _.map(zoubanExams, (obj) => examUitls.getExamById(obj['exam'], '50'));
//         return when.all(zoubanExamPromises);
//     }).

// TODO: 接口过滤出走班考试；如果有必要则还需要对grade进行过滤
//  */
//     zoubanExams = [{name: "2016.10高二第二次学考模拟考", exam: '101772-10202', event_time: "2016-10-04T00:00:00.000Z", from: '50'}, {name: "2015-2016学年第二学期期末初一年级组", exam: '100532-10172', event_time: "2016-07-02T04:57:46.000Z", from: '50'}];
//     zoubanExams = _.chain(zoubanExams).map((obj) => _.assign({}, obj, {timestamp: moment(obj['event_time']).valueOf()})).orderBy(['timestamp'], ['desc']).value();

//     var zoubanExamPromises = _.map(zoubanExams, (obj) => examUitls.getExamById(obj['exam'], '50'));
//     when.all(zoubanExamPromises).then(function(zoubanExamInstances) {
//         //TODO:怎么获取lessonName
//         var temp;
//         var result = _.map(zoubanExams, (obj, index) => {

//             temp = _.pick(obj, ['name', 'from']);
//             temp.id = obj['exam'];
//             temp.papers = _.map(zoubanExamInstances[index]['[papers]'], (paperItem) => {
//                 if(_.includes(paperItem.name, '文科')) return {lessonName: `${paperItem.subject}(文科)`, objectId: paperItem.paper, id: paperItem.id, fullMark: paperItem.manfen};
//                 if(_.includes(paperItem.name, '理科')) return {lessonName: `${paperItem.subject}(理科)`, objectId: paperItem.paper, id: paperItem.id, fullMark: paperItem.manfen};
//                 return {lessonName: paperItem.subject, objectId: paperItem.paper, id: paperItem.id, fullMark: paperItem.manfen};
//             });
//             return temp;
//         });
//         //按时间排一下顺序
//         res.status(200).json(result);
//     }).catch(function(err) {
//         next(err);
//     });
// }
