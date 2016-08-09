//总分分布趋势


import React, { PropTypes } from 'react';
import {makeSegments, makeSegmentsCount} from '../../../../api/exam';


//Mock的数据放在全局这里

export default function Trend({reportDS, currentClass}) {
    //Mock的数据不要放在这里！！！
    var examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var DS = makeDS(examInfo, studentsGroupByClass, currentClass);
}



//=================================================  分界线  =================================================
//TODO: 计算偏度，得到文案数据！

function makeDS(reportDS, studentsGroupByClass, currentClass) {
    var segments = makeSegments(examInfo.fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsCount(studentsGroupByClass[currentClass], segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}
