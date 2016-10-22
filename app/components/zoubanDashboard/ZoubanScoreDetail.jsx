import _ from 'lodash';
import React, { PropTypes } from 'react';
import {makeSegments, makeSegmentsString, makeSegmentsDistribution} from '../../sdk';

export default function ZoubanScoreDetail({zoubanLessonStudentsInfo, zoubanExamInfo}) {
    var simpleLesson = zoubanExamInfo.lessons[0];
    var currentLessonStudentsInfo = zoubanLessonStudentsInfo[simpleLesson.objectId];
    var segments = makeSegments(simpleLesson.fullMark, 0, 10);
    var segmentsString = makeSegmentsString(segments);
    var simpleClass = simpleLesson.classes[0];
    var classSegmentDistribution = getClassSegmentDistribution(simpleClass, segments, currentLessonStudentsInfo);
    debugger;
    return (
        <div>待填充</div>
    )
}

function getClassSegmentDistribution(simpleClass, segments, currentLessonStudentsInfo) {
    var info = makeSegmentsDistribution(segments, currentLessonStudentsInfo[simpleClass]);
    info = _.map(info, (obj) => obj.count);
    return {
        name: simpleClass,
        data: info
    }
}
