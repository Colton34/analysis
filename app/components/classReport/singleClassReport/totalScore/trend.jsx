import React, { PropTypes } from 'react';
import {makeSegments, makeSegmentsCount} from '../../../../api/exam';

export default function Trend({reportDS, currentClass}) {
    var examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var DS = makeDS(examInfo, studentsGroupByClass, currentClass);
}



function makeDS(reportDS, studentsGroupByClass, currentClass) {
    var segments = makeSegments(examInfo.fullMark);

    var xAxons = _.slice(segments, 1);
    var yAxons = makeSegmentsCount(studentsGroupByClass[currentClass], segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}
