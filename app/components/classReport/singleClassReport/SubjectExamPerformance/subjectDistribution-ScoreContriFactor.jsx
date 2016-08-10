//学科得分贡献指数
import _ from 'lodash';
import React, { PropTypes } from 'react';
import {makeFactor} from '../../../../api/exam';

export default function SubjectContriFactor({reportDS, currentClass}) {

}

//=================================================  分界线  =================================================

// export default function SubjectContriFactor({reportDS, currentClass}) {
//     var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), headers = reportDS.headers.toJS();
//     var theDS = getDS(examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers, currentClass);
// }

function getDS(examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers, currentClass) {
    var subjectMeanInfo = makeClassExamMeanInfo(examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, currentClass);
    var factorsTableData = theClassExamMeanFactorsTable(subjectMeanInfo, examInfo, studentsGroupByClass, headers, currentClass);
}

function makeClassExamMeanInfo(examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, currentClass) {
    var result = {};
    result.totalSchool = makeOriginalSubjectInfoRow(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo);
    result[currentClass] = makeOriginalSubjectInfoRow(studentsGroupByClass[currentClass], examPapersInfo, examInfo, examClassesInfo);
    return result;
}

//一行的得分率！！！
function makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo, examClassesInfo) {
    var result = {};
    result.totalScore = {};

    result.totalScore.mean = _.round(_.mean(_.map(students, (student) => student.score)), 2);
    result.totalScore.count = _.filter(students, (student) => student.score >= result.totalScore.mean).length;
    result.totalScore.meanRate = _.round(_.divide(result.totalScore.mean, examInfo.fullMark), 2);//注意这里没有使用百分制

    result.totalScore.countPercentage = _.round(_.multiply(_.divide(result.totalScore.count, students.length), 100), 2);//注意这里使用了百分制
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};

        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.count = _.filter(papers, (paper) => paper.score >= obj.mean).length;
        obj.meanRate = _.round(_.divide(obj.mean, examPapersInfo[pid].fullMark), 2);//注意这里没有使用百分制
        obj.countPercentage = _.round(_.multiply(_.divide(obj.count, students.length), 100), 2);//注意这里使用了百分制

        result[pid] = obj;
    });
    return result;
}

/**
 * TODO：但是当前要的是一个图表
 * //是平均得分率的小数表示的matrix
 * @param  {[type]} subjectMeanInfo [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function theClassExamMeanFactorsTable(subjectMeanInfo, examInfo, studentsGroupByClass, headers, currentClass) {
    var orderSubjectNames = _.map(headers.slice(1), (obj) => obj.subject);

    var originalMatrix = makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers, currentClass);
    var currentClassFactors = makeFactor(originalMatrix)[0];//应该只剩下一行
    //这里对orderSubjectNames进行Map还是为了保证横轴是按照科目的名称进行排序显示的
    var currentClassSubjectFactors = _.map(orderSubjectNames, (subjectName, index) => {
        return {subject: subjectName, factor: currentClassFactors[index]} //应该和orderSubjectNames的数目一样多
    });
    var orderCurrentClassSubjectFactors = _.sortBy(currentClassSubjectFactors, 'factor');
    var bestSubject = _.last(orderCurrentClassSubjectFactors).subject;
    var worstSubject = _.first(orderCurrentClassSubjectFactors).subject;
    return {
        currentClassSubjectFactors: currentClassSubjectFactors,
        bestSubject: bestSubject,
        worstSubject: worstSubject
    }
}

function makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers, currentClass) {
    var matrix = [], subjectMenaObj = subjectMeanInfo[currentClass];
    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;

    matrix.push(_.map(headers, (headerObj) => totalSchoolMeanObj[headerObj.id].meanRate));
    matrix.push(_.map(headers, (headerObj) => (subjectMenaObj[headerObj.id]) ? subjectMenaObj[headerObj.id].meanRate : '无数据'));

    return matrix;
}

