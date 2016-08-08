import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function LevelGuide({reportDS, currentClass}) {
    var levels = reportDS.levels.toJS(), examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var fullMark = examInfo.fullMark, currentClassStudents = studentsGroupByClass[currentClass];
    var topOneScore = _.last(currentClassStudents).score;

    return (
        <div>

        </div>
    );
}
