//临界生群体分析

import React, { PropTypes } from 'react';
import {NUMBER_MAP as numberMap} from '../../../lib/constants';
import {makeSegmentsCount} from '../../../api/exam';

export default  function CriticalStudent() {

}

//=================================================  分界线  =================================================
function makeChartXAxis(levels) {
    return _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index+1] + '档临界生人数';
    });
}

function makeCriticalStudentsInfo(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass) {
    var criticalLevelInfo = {}, currentClassStudents = studentsGroupByClass[currentClass];
    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCounts = makeSegmentsCount(students, segments);
    var classRow = _.filter(classCounts, (count, index) => (index % 2 == 0));//从低到高
    classRow = _.reverse(classRow); //从高到底

    _.each(classRow, (count, index) => {
        criticalLevelInfo[index] = count;//这里是反转后的数据。
    });
    return criticalLevelInfo;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}

function criticalStudentsTable() {
    // levels = levels || makeDefaultLevles(examInfo, examStudentsInfo);
    // levelBuffers = levelBuffers || _.map(_.range(_.size(levels)), (index) => 10);

    var table = [], criticalLevelInfo = {};

    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });

    var titleHeader = _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index+1] + '档临界生人数';
    });
    titleHeader.unshift('分档临界生');

    table.push(titleHeader);

    var segments = makeCriticalSegments(levelBuffers, levels);

    var totalSchoolCounts = makeSegmentsCount(examStudentsInfo, segments);

    var totalSchool = _.filter(totalSchoolCounts, (count, index) => (index % 2 == 0));

    totalSchool = _.reverse(totalSchool);
    totalSchool.unshift('全校');
    table.push(totalSchool);

    _.each(studentsGroupByClass, (students, className) => {
        var classCounts = makeSegmentsCount(students, segments);
        var classRow = _.filter(classCounts, (count, index) => (index % 2 == 0));//从低到高
        classRow = _.reverse(classRow); //从高到底

        _.each(classRow, (count, index) => {
            criticalLevelInfo[index].push({'class': className, count: count});//因为这里使用的是反转后得到classRow，所以这里criticalLevelInfo中的
                                                                                    //levelKey是颠倒后的，即小值代表高档
        });

        classRow.unshift(examInfo.gradeName+className+'班');
        table.push(classRow);
    });
    return {tableData: table, criticalLevelInfo: criticalLevelInfo};
}
