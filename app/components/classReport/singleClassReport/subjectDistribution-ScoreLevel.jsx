//学科分档学生人数分布

import React, { PropTypes } from 'react';
import _ from 'lodash';

export default function SubjectLevelDisribution() {

}

//=================================================  分界线  =================================================
//各个档次的table数据以及各个档次的文案数据

function temp(levels, subjecLevels, headers, gradeName, currentClass) {
    var result = {};
    _.each(levels, (levObj, levelKey) => {
        var currentSubjectLevels = _.find(subjecLevels, (obj) => obj.levelKey == levelKey);
        if(!currentSubjectLevels) return;
        var currentSubjectLevelInfo = makeCurrentSubjectLevelInfo(currentSubjectLevels.values, levObj, currentClass);
        var {validOrderedSubjectMean} = filterMakeOrderedSubjectMean(headers, subjectsMeanArr);
        var tableData = getTableData(currentSubjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass);
        var bestAndWorst = getBestAndWorst(currentSubjectLevelInfo, currentClass, currentSubjectLevels.values);
    })
}

function getBestAndWorst(currentSubjectLevelInfo, currentClass, currentSubjectLevels) {
    var data = currentSubjectLevelInfo[currentClass], subjectLevelMap = _.keyBy(currentSubjectLevels, 'id');
    var best = {}, worst = {};
    _.each(data, (count, key) => {
        if(key == 'totalScore') return;
        if(!best.pid || count > best.count) best = {pid: key, count: count, subject: subjectLevelMap[key]};
        if(!worst.pid || count < worst.count) worst = {pid: key, count: count, subject: subjectLevelMap[key]};
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
function getTableData(subjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass) {
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
function makeCurrentSubjectLevelInfo(currentSubjectLevels, levObj, currentClass) {
    var currentSubjectLevelInfo = {};
    currentSubjectLevelInfo.totalSchool = {};
    currentSubjectLevelInfo.totalSchool.totalScore = levObj.count;
    _.each(currentSubjectLevels, (subMeanInfo, index) => {
        // if(pid == 'totalScore') return; -- 没有totalScore
        currentSubjectLevelInfo.totalSchool[subMeanInfo.id] = _.filter(allStudentsPaperMap[subMeanInfo.id], (paper) => paper.score > subMean.mean).length;
    });
    var temp = {};
    temp.totalScore = _.filter(classStudents, (student) => student.score > levelScore).length;
    _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
        temp[pid] = _.filter(papers, (paper) => paper.score > currentSubjectLevels[pid].mean).length;
    });
    currentSubjectLevelInfo[currentClass] = temp;
    return currentSubjectLevelInfo;
}

//TODO:抽取出来，作为Common Report Util
function filterMakeOrderedSubjectMean(headers, subjectsMeanArr) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var subMeanMap = _.keyBy(subjectsMeanArr, 'id');
    var valids = [], unvalids = [];
    _.each(headers, (headerObj) => {
        if(subMeanMap[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subMeanMap[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subMeanMap[headerObj.id].mean});
        }
    });
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}
