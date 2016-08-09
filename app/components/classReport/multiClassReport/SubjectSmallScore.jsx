//学科小分得分率对比

import React, { PropTypes } from 'react';

export default function SubjectSmallScore() {

}


//=================================================  分界线  =================================================
//TODO: 设计--主客观题都走 分数 好了，而不再分客观题走数目--结果是一样的
function getQuestionScoreRate(currentPaper) {
//横向扫描得到每一个题目的维度
//应该是currentPaper，currentSubject是个paper的subject字符串名字
// [questions] [students] matrix answers
    var matrix = [];
    var tableHeader = getTableHeader();
    matrix.push(tableHeader);
    _.each(allQuestions, (questionObj, index) => {
        var tempRow = [];
        var gradeQuestionScoreRate = getGradeQuestionScoreRate(allStudents, questionObj, index);
        tempRow.push(gradeQuestionScoreRate);
        var allClassesQuestionScoreRate = _.map(studentsGroupByClass, (classStudents, className) => getClassQuestionScoreRate(classStudents, questionObj, index));
        tempRow = _.concat(tempRow, allClassesQuestionScoreRate);
        tempRow.unshift(questionObj.name);
        matrix.push(tempRow);
    });
    return matrix;
}

function getTableHeader() {

}

function getGradeQuestionScoreRate(allStudents, questionObj, index) {

}

function getClassQuestionScoreRate(classStudents, questionObj, index) {

}
