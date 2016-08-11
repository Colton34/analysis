//学科小分得分率对比
import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function SubjectSmallScore({reportDS}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), gradeName = reportDS.examInfo.toJS().gradeName;
    var theDS = getDS(examPapersInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, gradeName);
    debugger;
}


//=================================================  分界线  =================================================
//TODO: 设计--主客观题都走 分数 好了，而不再分客观题走数目--结果是一样的
function getDS(examPapersInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, gradeName) {
    var allStudentsPaperQuestionInfo = {}, result = {}, tableDS, rowData;
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        tableDS = [];
        _.each(paperObj.questions, (questionObj, index) => {
            rowData = [];
            var gradeScoreRate = getOneQuestionScoreRate(questionObj, allStudentsPaperMap[paperObj.id], allStudentsPaperQuestionInfo, pid, index);
            rowData.push(gradeScoreRate);
            var classesScoreRate = getClassesQuestionScoreRate(questionObj, allStudentsPaperMap[paperObj.id], allStudentsPaperQuestionInfo, pid, index, examClassesInfo);
            rowData = _.concat(rowData, classesScoreRate);
            rowData.unshift(questionObj.name);
            tableDS.push(rowData);
        });
        tableDS.unshift(getTableHeader(allStudentsPaperMap[paperObj.id], examClassesInfo, gradeName));
        result[pid] = tableDS;
    });
    return result;
}

function getTableHeader(allPaperStudents, examClassesInfo, gradeName) {
    var result = [];
    var classPaperStudentsMap = _.groupBy(allPaperStudents, 'class_name');
    _.each(examClassesInfo, (classObj, className) => {
        var classPaperStudents = classPaperStudentsMap[className];
        if(classPaperStudents && classPaperStudents.length > 0) result.push(gradeName+className+'班');
    });
    result = _.concat(['题目', '年级平均得分率'], result);
    return result;
}

function getOneQuestionScoreRate(questionObj, students, allStudentsPaperQuestionInfo, pid, index) {
    return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
        // debugger;
        return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
    })), questionObj.score), 2);
}

function getClassesQuestionScoreRate(questionObj, allPaperStudents, allStudentsPaperQuestionInfo, pid, index, examClassesInfo) {
    var classPaperStudentsMap = _.groupBy(allPaperStudents, 'class_name');
    var result = [];
    _.each(examClassesInfo, (classObj, className) => {
        var classPaperStudents = classPaperStudentsMap[className];
        if(!classPaperStudents || classPaperStudents.length == 0) return;
        result.push(getOneQuestionScoreRate(questionObj, classPaperStudents, allStudentsPaperQuestionInfo, pid, index));
    });
    return result;
}





// function getQuestionScoreRate(currentPaper) {
// //横向扫描得到每一个题目的维度
// //应该是currentPaper，currentSubject是个paper的subject字符串名字
// // [questions] [students] matrix answers
//     var matrix = [];
//     var tableHeader = getTableHeader();
//     matrix.push(tableHeader);
//     _.each(allQuestions, (questionObj, index) => {
//         var tempRow = [];
//         var gradeQuestionScoreRate = getGradeQuestionScoreRate(allStudents, questionObj, index);
//         tempRow.push(gradeQuestionScoreRate);
//         var allClassesQuestionScoreRate = _.map(studentsGroupByClass, (classStudents, className) => getClassQuestionScoreRate(classStudents, questionObj, index));
//         tempRow = _.concat(tempRow, allClassesQuestionScoreRate);
//         tempRow.unshift(questionObj.name);
//         matrix.push(tempRow);
//     });
//     return matrix;
// }

// function getQuestionScoreRate(questions, pid, students, allStudentsPaperQuestionInfo) {
// //计算本班级的此道题目的得分率：
//     //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
//     return _.map(questions, (questionObj, index) => {
//         //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
//         return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
//             // debugger;
//             return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
//         })), questionObj.score), 2);
//     });
// }



// function getTableHeader() {

// }

// function getGradeQuestionScoreRate(allStudents, questionObj, index) {

// }

// function getClassQuestionScoreRate(classStudents, questionObj, index) {

// }
