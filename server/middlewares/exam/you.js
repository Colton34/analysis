/*
* @Author: HellMagic
* @Date:   2016-09-23 09:54:29
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-23 14:07:18
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
            if(fromType) data.from = fromType;
            resolve(data);
        });
    })
}

//暂时还没有用到
// var getPaperById = exports.getPaperById = function(paperId, fromType) {//Warning: 不是pid，而是paperId-即mongoID
//     var url = config.analysisServer + '/exam?id=' + examid;

//     return when.promise(function(resolve, reject) {
//         client.get(url, {}, function(err, res, body) {
//             if (err) return reject(new errors.URIError('查询analysis server(getPaperById) Error: ', err));
//             var temp = JSON.parse(body);
//             if(temp.error) return reject(new errors.Error('查询analysis server(getPaperById)失败, paperId = ' + paperId));
//             if(fromType) temp.from = fromType;
//             resolve(temp);
//         });
//     })
// }

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


//TODO: 通过 http://fx-engine.yunxiao.com/total?p=57d80da9000005fa29d0db77 逐个获取papers信息--有点像generateExamStudentsInfo--所以这一步可以直接把这个数据结构也生成了--直接面向最后的结果即可（其实这里DS还可以再考虑一下，不过
//当前就先按照原来的DS进行获取）
exports.generateExamScoresInfo = function(exam, auth) {

}

//这里返回的就是examStudentsInfo
/*
            {
                id:
                name:
                class:
                score:
                school:（注意是school name而不是school id）
                papers: [
                    {id: , paperid: , score: , class_name: }
                ],
                questionScores: [
                    {paperid: , scores: [], answers: [] }
                ]
            },

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

/*
一个Map:
    key: <className> -- 一场考试下的（有可能有不同年级）所有班级
    value: 此班级下所有所有参加考试学生的总分信息
 */
function fetchExamScoresById(examid) {
    var url = config.testRankBaseUrl + '/scores' + '?' + 'examid=' + examid;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(scores)失败', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('获取rank服务数据错误，examid='+examid));
            var keys = _.keys(data);
            resolve(data[keys[0]]);
        });
    });
}


function getExamById(examid) {
    return when.promise(function(resolve, reject) {
        peterHFS.get('@Exam.'+examid, function(err, exam) {
            if(err || !exam) return reject(new errors.data.MongoDBError('find exam = '+ examid + 'Error: ', err));
            resolve(exam);
        });
    });
}

var getSchoolById = exports.getSchoolById = function(schoolid) {
    return when.promise(function(resolve, reject) {
        peterHFS.get('@School.'+schoolid, function(err, school) {
            if(err || !school) return reject(new errors.data.MongoDBError('find school:'+schoolid+' error', err));
            resolve(school);
        });
    });
};

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




