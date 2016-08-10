//总分分布趋势


import _ from 'lodash';
import React, { PropTypes } from 'react';
import {makeSegments, makeSegmentsCount} from '../../../api/exam';

//Mock的数据放在全局这里

export default function Trend({reportDS, currentClass}) {
    //Mock的数据不要放在这里！！！
    var examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var DS = makeDS(examInfo, studentsGroupByClass, currentClass);
}



//=================================================  分界线  =================================================
//TODO: 计算偏度，得到文案数据！-- 没有了？？？


// export default function Trend({reportDS, currentClass}) {
//     //Mock的数据不要放在这里！！！
//     var examInfo = reportDS.examInfo.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
//     var headerData = getHeaderData(examStudentsInfo);
//     var chartDS = getChartDS(examInfo.fullMark, studentsGroupByClass, currentClass);
//     debugger;
// }


function getHeaderData(examStudentsInfo) {
    var mean = _.mean(_.map(examStudentsInfo, (obj) => obj.score));
    var bestScore = _.last(examStudentsInfo).score;
    var worstScore = _.first(examStudentsInfo).score;
    return {
        bestScore: bestScore,
        worstScore: worstScore,
        mean: mean
    }
}

function getChartDS(fullMark, studentsGroupByClass, currentClass) {
    var segments = makeSegments(fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsCount(studentsGroupByClass[currentClass], segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}
