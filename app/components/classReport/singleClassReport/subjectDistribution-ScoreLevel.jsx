//学科分档学生人数分布

import React, { PropTypes } from 'react';
import _ from 'lodash';

export default function SubjectLevelDisribution() {

}

//=================================================  分界线  =================================================

// export default function SubjectLevelDisribution({reportDS, currentClass}) {
//     var studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), levels = reportDS.levels.toJS(), subjecLevels = reportDS.subjectLevels.toJS(), headers = reportDS.headers.toJS(), gradeName = reportDS.examInfo.toJS().gradeName;
//     var theDS = getDS(levels, subjecLevels, headers, gradeName, currentClass, studentsGroupByClass[currentClass], allStudentsPaperMap);
// }



//各个档次的table数据以及各个档次的文案数据

function getDS(levels, subjecLevels, headers, gradeName, currentClass, classStudents, allStudentsPaperMap) {
    var result = {};
    _.each(levels, (levObj, levelKey) => {
        var subjectLevelMeanInfo = subjecLevels[levelKey];   //_.find(subjecLevels, (obj) => obj.levelKey == levelKey);
        if(!subjectLevelMeanInfo) return;

        var currentSubjectLevelInfo = makeCurrentSubjectLevelInfo(subjectLevelMeanInfo, levObj, currentClass, classStudents, allStudentsPaperMap);
        var {validOrderedSubjectMean} = filterMakeOrderedSubjectMean(headers, subjectLevelMeanInfo);
        var tableDS = getTableDS(currentSubjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass);
        var bestAndWorst = getBestAndWorst(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo);
        result[levelKey] = {tableDS: tableDS, bestAndWorst: bestAndWorst}
    });
    debugger;
    return result;
}

function getBestAndWorst(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo) {
    var data = currentSubjectLevelInfo[currentClass];    //subjectLevelMap = _.keyBy(currentSubjectLevels, 'id');
    var best = {}, worst = {};
    _.each(data, (count, key) => {
        if(key == 'totalScore') return;
        if(!best.pid || count > best.count) best = {pid: key, count: count, subject: subjectLevelMeanInfo[key].name};
        if(!worst.pid || count < worst.count) worst = {pid: key, count: count, subject: subjectLevelMeanInfo[key].name};
    });
    return {best: best, worst: worst};
}


/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function getTableDS(subjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass) {
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
        return (_.isUndefined(subjectLevelInfo[headerObj.id])) ? '无数据' : subjectLevelInfo[headerObj.id];
    });
    classRow.unshift(gradeName + currentClass + '班');
    table.push(classRow);

    table.unshift(titleHeader);

    return table;
}

/**
 * 创建学科分析需要的info数据结构
 * @param  {[type]} currentSubjectLevels [description]
 * @param  {[type]} levObj               [description]
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
function makeCurrentSubjectLevelInfo(subjectLevelMeanInfo, levObj, currentClass, classStudents, allStudentsPaperMap) {
    var currentSubjectLevelInfo = {};
    currentSubjectLevelInfo.totalSchool = {};
    currentSubjectLevelInfo.totalSchool.totalScore = levObj.count;
    _.each(subjectLevelMeanInfo, (subMeanInfo, pid) => {
        // if(pid == 'totalScore') return; -- 没有totalScore
        currentSubjectLevelInfo.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score > subMeanInfo.mean).length;
    });
    var temp = {};
    temp.totalScore = _.filter(classStudents, (student) => student.score > levObj.score).length;
    _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
        // debugger;
        temp[pid] = _.filter(papers, (paper) => paper.score > subjectLevelMeanInfo[pid].mean).length;
    });
    currentSubjectLevelInfo[currentClass] = temp;
    return currentSubjectLevelInfo;
}

//TODO:抽取出来，作为Common Report Util
function filterMakeOrderedSubjectMean(headers, subjectLevelMeanInfo) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var valids = [], unvalids = [];
    _.each(headers, (headerObj) => {
        if(headerObj.id == 'totalScore') return;
        if(subjectLevelMeanInfo[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        }
    });
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}


/*
subjectLevels:
    存储的是个array: [ { levelKey: xxx, values: {} } ]
    state中是个Map: { <levelKey> : <values> }
 */
