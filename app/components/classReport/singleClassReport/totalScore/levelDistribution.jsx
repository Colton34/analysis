//总分分档学生人数分布

import _ from 'lodash';
import React from 'react';

export default function LevelDistribution({reportDS, currentClass}) {
    var levels = reportDS.levels.toJS(), examInfo=reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), headers = reportDS.headers.toJS();
    var currentClassStudents = studentsGroupByClass[currentClass];
    var levelTables = {};
    _.each(levels, (levObj, levelKey) => {
        var subjectLevelInfo = makeSubjectLevelInfo(levObj, examStudentsInfo, currentClassStudents, currentClass);
        var {validOrderedSubjectMean, unvalids} = filterMakeOrderedSubjectMean(headers, levObj.subjects);
        var tableData = makeTableData(subjectLevelInfo, validOrderedSubjectMean, examInfo.gradeName);
        levelTables[levelKey] = tableData;
    });
}



//=================================================  分界线  =================================================



/**
 * 创建学科分析需要的info数据结构
 * @param  {[type]} levelScore           [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} allStudentsPaperMap  [description]
 * @param  {[type]} examPapersInfo       [description]
 * @param  {[type]} examFullMark         [description]
 * @return {[type]}                      info格式的学科分析的数据结构
 * {
 *     totalSchool: {
 *         totalScore: <count>
 *         <pid>: <count>
 *
 *     },
 *     <className>: {
 *         totalScore: <count>
 *         <pid>: <count>
 *     },
 *     ...
 * }
 */
function makeSubjectLevelInfo(levObj, allStudents, currentClassStudents, currentClass) {
    var subjectsMean = levObj.subjects;
    var subjectLevelInfo = {};
    subjectLevelInfo.totalSchool = {};
    subjectLevelInfo.totalSchool.totalScore = levObj.count;
    _.each(subjectsMean, (subMean, pid) => {
        if(pid == 'totalScore') return;
        subjectLevelInfo.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score > subMean.mean).length;
    });
    var temp = {};
    temp.totalScore = _.filter(classStudents, (student) => student.score > levelScore).length;
    _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
        temp[pid] = _.filter(papers, (paper) => paper.score > subjectsMean[pid].mean).length;
    });
    subjectLevelInfo[currentClass] = temp;
    return subjectLevelInfo;
}

/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function makeTableData(subjectLevelInfo, validOrderedSubjectMean, gradeName) {
    var table = [];
    var titleHeader = _.map(validOrderedSubjectMean, (headerObj, index) => {
        return headerObj.subject + '(' + headerObj.mean + ')';
    });
    titleHeader.unshift('班级');

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    var classRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return (_.isUndefined(subjectLevelObj[headerObj.id])) ? '无数据' : subjectLevelObj[headerObj.id];
    });
    classRow.unshift(gradeName + currentClass + '班');
    table.push(classRow);

    table.unshift(titleHeader);

    return table;
}

//TODO:抽取出来，作为Common Report Util
function filterMakeOrderedSubjectMean(headers, subjectsMean) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var valids = [], unvalids = [];
    _.each(headers, (headerObj) => {
        if(subjectsMean[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectsMean[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectsMean[headerObj.id].mean});
        }
    });
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}
