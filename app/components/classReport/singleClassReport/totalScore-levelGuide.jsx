//分档分数线文案（总分分布趋势下面的那一小块）

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


//=================================================  分界线  =================================================
//Note: 数据已Ready
