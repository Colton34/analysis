//总分分档学生人数分布

import _ from 'lodash';
import React from 'react';
import {makeSegmentsCount} from '../../../api/exam';

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
// export default function LevelDistribution({reportDS, currentClass}) {
//     var examInfo=reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), levels = reportDS.levels.toJS() , headers = reportDS.headers.toJS();
//     var currentClassStudents = studentsGroupByClass[currentClass];
//     var {totalScoreLevelInfoByClass, totalScoreLevelInfoByLevel} = makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels);
//     var headerData = getHeaderData(totalScoreLevelInfoByLevel, currentClass);
//     debugger;
//     var tableDS = getTableDS(totalScoreLevelInfoByClass, levels);
// }


//1.各个档次本班在全年级的排名
//2.人数，累计人数，累计上线比

/**
 * 获取总分分档的info数据结构（info数据结构是一种具有典型格式的数据结构： {totalSchool: {...}, <className>: {...} } ）每一个key中的value对象中的key就是横向扫描
 * 的属性，个数和顺序都一样！！！这里totalSchool和<className>其实就是列的key，所以info是一个二重的Map，按照需要的matrixTable创建，横向扫描，一重key是列的key，二
 * 重key是行的key。列key没有顺序，行key有顺序。（比如如果是分档，则高档在前，依次排列，如果是科目，则语数外在前，按照subjectWeight排列）
 * @param  {[type]} examInfo             [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} examClassesInfo      [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} levels               [description]
 * @return 这里横向轴是分档所以对象就是分档信息
 *     {
 *         totalSchool: {
 *
 *         },
 *         <className>: {
 *
 *         }
 * }
 */
//resultByClass是totalScoreLevelInfo按照第一级是className（或'totalSchool'这个特殊的class key）作为key，第二级是levelKey，而resultByLevel的第一级是levelKey，第二级是className,
//而且不包含totalSchool这个特殊的key
function makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels) {
    var levelSegments = _.map(levels, (levObj) => levObj.score);
    levelSegments.push(examInfo.fullMark);

    var resultByClass = {}, resultByLevel = {};
    var countsGroupByLevel = makeSegmentsCount(examStudentsInfo, levelSegments);
    resultByClass.totalSchool = {};

    _.each(countsGroupByLevel, (count, levelKey) => {
        resultByClass.totalSchool[levelKey] = makeLevelInfoItem(levelKey, countsGroupByLevel, examInfo.realStudentsCount); //TODO:levels中的percentage就是累占比呀！
    });

    _.each(studentsGroupByClass, (studentsFromClass, className) => {
        var classCountsGroupByLevel = makeSegmentsCount(studentsFromClass, levelSegments);
        var temp = {};
        _.each(classCountsGroupByLevel, (count, levelKey) => {
            temp[levelKey] = makeLevelInfoItem(levelKey, classCountsGroupByLevel, examClassesInfo[className].realStudentsCount, className);
            if(!resultByLevel[levelKey]) resultByLevel[levelKey] = [];
            resultByLevel[levelKey].push(temp[levelKey]);
        });
        resultByClass[className] = temp;
    });

    return {totalScoreLevelInfoByClass: resultByClass, totalScoreLevelInfoByLevel: resultByLevel};
}

function makeLevelInfoItem(levelKey, countsGroupByLevel, baseCount, className) {
    var levItem = {};

    levItem.count = countsGroupByLevel[levelKey];
    levItem.sumCount = _.sum(_.map(_.pickBy(countsGroupByLevel, (v, k) => k >= levelKey), (count) => count));
    levItem.sumPercentage = _.round(_.multiply(_.divide(levItem.sumCount, baseCount), 100), 2);
    levItem.class = className;

    return levItem;
}


function getHeaderData(totalScoreLevelInfoByLevel, currentClass) {
//totalScoreLevelInfo中的level都是和levels对应的--index小则对应低档次
//从totalScoreLevelInfoByLevel的各个档次中排序得到排名
    var result = [];
    _.each(totalScoreLevelInfoByLevel, (infoArr, levelKey) => {
        var targetIndex = _.findIndex(_.sortBy(infoArr, 'sumCount'), (obj) => obj.class == currentClass);
        if(targetIndex < 0) return;//TODO:应该给Tip Error！-- 这也是需要改进的：清晰明了的错误提示
        result.unshift('第'+(targetIndex + 1)+'名'); //使用unshift保证高档在前面
    });
    return result;
}


function getTableDS(totalScoreLevelInfoByClass, currentClass, levels) {
    //Note: 直接从这里取需要的数据即可。只需要全校和本班的数据

}

