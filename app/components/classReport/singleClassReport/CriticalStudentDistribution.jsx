//临界生群体分析
import _ from 'lodash';
import React, { PropTypes } from 'react';
import {NUMBER_MAP as numberMap} from '../../../lib/constants';
import {makeSegmentsCount} from '../../../api/exam';

export default  function CriticalStudent() {

}

//=================================================  分界线  =================================================

// export default  function CriticalStudent({reportDS, currentClass}) {
//     var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), levels = reportDS.levels.toJS(), levelBuffers = reportDS.levelBuffers.toJS();
//     var theDS = getDS(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass);
// }

function getDS(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass) {
    var xAxis = makeChartXAxis(levels);
    var criticalStudentInfo = makeCriticalStudentsInfo(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass);
    debugger;
}

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
    var classCounts = makeSegmentsCount(studentsGroupByClass[currentClass], segments);
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
