/*
* @Author: HellMagic
* @Date:   2016-09-23 09:54:29
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-26 12:30:18
*/

'use strict';

var _ = require('lodash');
var when = require('when');
var client = require('request');
var moment = require('moment');
var config = require('../../config/env');
var errors = require('common-errors');

var peterFX = require('peter').getManager('fx');

var getExamById = exports.getExamById = function(examid, fromType) {
    var url = config.analysisServer + '/exam?id=' + examid;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getExamById) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(getExamById)失败, examid = ' + examid));
            data.fetchId = examid;
            if(fromType) data.from = fromType;
            resolve(data);
        });
    })
}

var getPaperById = exports.getPaperById = function(paperId) {//Warning: 不是pid，而是paperId-即mongoID
    var url = config.analysisServer + '/paper?p=' + paperId;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getPaperById) Error: ', err));
            var temp = JSON.parse(body);
            if(temp.error) return reject(new errors.Error('查询analysis server(getPaperById)失败, paperId = ' + paperId));
            resolve(temp);
        });
    })
}

exports.getExamsBySchoolId = function(schoolId) {
    var url = config.analysisServer + '/school?id=' + schoolId;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getExamsBySchool) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) reject(new errors.URIError('查询analysis server(getExamsBySchool)失败, schoolId = ', schoolId));
            resolve(data);
        });
    }).then(function(data) {
        //Note:去掉40的是为了去掉1.7旧的创建的自定义分析，不适合新的分析系统，所以走了自己一个新的分析。后面会统一使用analysis server进行save(custom analysis)
        var examPromises = _.map(_.filter(data["[exams]"], (item) => (item.from != 40)), (obj) => getExamById(obj.exam, obj.from));
        return when.all(examPromises);
    });
}

exports.generateExamInfo = function(examId, gradeName, schoolId) {
    return getExamById(examId).then(function(exam) {
        exam.fetchId = examId;
        exam['[papers]'] = _.filter(exam['[papers]'], (paper) => paper.grade == gradeName);//【设计】TODO:analysis server提供grade的参数，没必要在这里在过滤区分--或者analysis的exam的[papers]就不会存在有不同年级的paper的情况
        exam.fullMark = _.sum(_.map(exam['[papers]'], (paper) => paper.manfen));
        return when.all([getValidSchoolGrade(schoolId, gradeName), getGradeExamBaseline(examId, gradeName)]);
    }).then(function(results) {
        exam.grade = results[0], exam.baseline = results[1];
        return when.resolve(exam);
    })
}

function getValidSchoolGrade(schoolId) {
    return when.promise(function(resolve, reject) {
        peterHFS.get('@School.'+schoolId, function(err, school) {
            if(err || !school) {
                console.log('不存在此学校，请确认：schoolId = ', schoolId);
                return reject(new errors.data.MongoDBError('find school:'+schoolId+' error', err));
            }
            var targetGrade = _.find(school['[grades]'], (grade) => grade.name == gradeName);
            if (!targetGrade || !targetGrade['[classes]'] || targetGrade['[classes]'].length == 0) {
                console.log('此学校没有对应的年假或从属此年级的班级：【schoolid = ' + schoolid + '  schoolName = ' + school.name + '  gradeName = ' + gradeName + '】');
                return when.reject(new errors.Error('学校没有找到对应的年级或者从属此年级的班级：【schoolid = ' +schoolid + '  schoolName = ' +school.name + '  gradeName = ' + gradeName + '】'));
            }
            resolve(targetGrade);
        });
    });
}

function getGradeExamBaseline(examId, grade) {
    // var targetObjId = paddingObjectId(examId); 设计：都存储短id好了！
    return when.promise(function(resolve, reject) {
        var config = (grade) ? {examid: examId, grade: grade} : {examid: examId};
        peterFX.query('@ExamBaseline', config, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('getGradeExamBaseline Mongo Error: ', err));
            resolve(results[0]);
        });
    });
}

exports.generateDashboardInfo = function(exam) {//这里依然没有对auth进行判断
    //走total paper好了--这样就绕开了
    var getPapersTotalInfoPromises = _.map(exam['[papers]'], (obj) => getPaperTotalInfo(obj.paper));
    return when.all(getPapersTotalInfoPromises).then(function(papers) {
        return when.resolve(generateStudentsTotalInfo(papers));
    });
}

function getPaperTotalInfo(paperId) {
    var url = config.analysisServer + '/total?p=' + paperId;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getPaperTotalInfo) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(getPaperTotalInfo)失败, paperId = ' + paperId));
            resolve(data);
        });
    });
}

function generateStudentsTotalInfo(papers) {
    var studentsTotalInfo = {}, paperStudentObj;
    _.each(papers, (paperObj) => {
        var studentsPaperInfo = paperObj.y;// matrix = paperObj.matrix, paperStudentObj, answers = paperObj.answers;
        _.each(studentsPaperInfo, (studentObj) => {
            paperStudentObj = studentsPaperInfo[studentObj.id];
            if(!paperStudentObj) {
                paperStudentObj = _.pick(studentObj, ['id', 'name', 'class', 'school']);
                paperStudentObj.score = 0;
                studentsPaperInfo[studentObj.id] = paperStudentObj;
            }
            paperStudentObj.score = paperStudentObj.score + studentObj.score;
        });
    });
    return _.sortBy(_.values(studentsTotalInfo), 'score');
    // return studentsTotalInfo;
}

exports.generateExamScoresInfo = function(exam, auth) {
    return fetchExamScoresById(exam.fetchId).then(function(scoresInfo) {
        var targetClassesScore = _.pick(scoresInfo, _.map(exam.grade['[classes]'], (classItem) => classItem.name));

        var orderedStudentScoreInfo = _.sortBy(_.concat(..._.values(targetClassesScore)), 'score');
        exam.realClasses = _.keys(targetClassesScore);
        exam.lostClasses = [], exam.realStudentsCount = 0, exam.lostStudentsCount = 0;

        //Note:缺考只是针对参加了考试的班级而言，如果一个班级没有参加此场考试，那么不会认为缺考（但是此班级会被作为lostClasses）
        _.each(exam.grade['[classes]'], (classItem, index) => {
            if (targetClassesScore[classItem.name]) {
                classItem.realStudentsCount = targetClassesScore[classItem.name].length;
                exam.realStudentsCount += classItem.realStudentsCount;
                classItem.lostStudentsCount = classItem['[students]'].length - classItem.realStudentsCount;
                exam.lostStudentsCount += classItem.lostStudentsCount;
            } else {
                exam.lostClasses.push(classItem.name);
            }
        });
        exam.realClasses = _.keys(targetClassesScore);

        return when.resolve({
            baseline: exam.baseline,
            classScoreMap: targetClassesScore,
            orderedScoresArr: orderedStudentScoreInfo
        });
    });
};

//testRankBaseUrl --> rankServer
function fetchExamScoresById(examId) {
    var url = config.testRankBaseUrl + '/scores' + '?' + 'examId=' + examId;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(fetchExamScoresById)Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询rank server(fetchExamScoresById)失败，examId='+examId));
            var keys = _.keys(data);
            resolve(data[keys[0]]);
        });
    });
}

//TODO:注意这里也没有用到auth--本来设计为从服务端传递的都是符合auth的数据，但是一些牵涉到【对比】的分析内容则需要不仅限于自己auth下的数据，所以这里就给了全部，需要二次设计重构。
exports.generateExamReportInfo = function(exam) {//**TODO:需要排序！！！
    return getPaperInstancesByExam(exam).then(function(papers) {
        var {examPapersInfo, examStudentsInfo} = generatePaperStudentsInfo(papers);
        examStudentsInfo = _.sortBy(_.values(examStudentsInfo), 'score');
        var examClassesInfo = generateExamClassesInfo(paperStudentsInfo);//TODO: Warning--这里本意是获取班级的【基本信息】，但是这又依赖于school.grade.class，所以这里【暂时】使用参考信息。
        return when.resolve({
            examStudentsInfo: examStudentsInfo,
            examPapersInfo: examPapersInfo,
            examClassesInfo: examClassesInfo
        })
    });
}

function getPaperInstancesByExam(exam) {
    var getPaperInstancePromises = _.map(exam['[papers]'], (obj) => getPaperById(obj.paper));
    return when.all(getPaperInstancePromises);
}

function generatePaperStudentsInfo(papers) {
    var examPapersInfo = {}, examStudentsInfo = {};
    _.each(papers, (paperObj) => {
        examPapersInfo[paperObj.id] = formatPaperInstance(paperObj);
        var students = paperObj['[students]'], matrix = paperObj.matrix, paperStudentObj, answers = paperObj.answers;
        _.each(students, (studentObj, index) => {
            paperStudentObj = examStudentsInfo[studentObj.id];
            if(!paperStudentObj) {
                paperStudentObj = _.pick(studentObj, ['id', 'name', 'class', 'school']);
                paperStudentObj.papers = [], paperStudentObj.questionScores = [], paperStudentObj.score = 0;
                examStudentsInfo[studentObj.id] = paperStudentObj;
            }
            paperStudentObj.score = paperStudentObj.score + studentObj.score;
            paperStudentObj.papers.push({id: paperObj.id, paperid: paperObj.paper, score: studentObj.score, 'class_name': studentObj.class});
            paperStudentObj.questionScores.push({paperid: paperObj.id, scores: matrix[index], answers: answers[index]});
        });
    });
    return {
        examPapersInfo: examPapersInfo,
        examStudentsInfo: examStudentsInfo
    }
}

function formatPaperInstance(paperObj) {
    var result = _.pick(paperObj, ['id', 'subject', 'grade']);
    result.paper = paperObj._id;
    result.fullMark = paperObj.manfen;
    result.questions = paperObj['[questions]'];
    var paperStudents = paperObj['[students]'];
    var paperStudentsByClass = _.groupBy(paperStudents, 'class');

    result.realClasses = _.keys(paperStudentsByClass);
    result.realStudentsCount = paperStudents.length;

    var paperClassCountInfo = {};
    _.each(paperStudentsByClass, (pcStudents, className) => {
        paperClassCountInfo[className] = pcStudents.length;
    });
    result.classes = paperClassCountInfo;
    return result;
}

function generateExamClassesInfo(examStudentsInfo) {
    var result = {}, studentsByClass = _.groupBy(examStudentsInfo, 'class');
    _.each(studentsByClass, (classStudents, className) => {
        var classStudentIds = _.map(classStudents, (obj) => obj.id);//TODO: 不确定之前DB中的school.grade.class.students里的String是kaohao, xuehao还是id。这里先存储为student.id
        result[className] = {
            name: className,
            students: classStudentIds,
            realStudentsCount: classStudentIds.length
        }
    })
}

//TODO：设计，保持dashboard的接口暂时还利用好分数的service
