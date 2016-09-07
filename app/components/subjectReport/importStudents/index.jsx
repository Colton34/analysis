import _ from 'lodash';
import React, { PropTypes } from 'react';

import ClassImportStudents from './classImportStudents';

export default function ImportStudentsModule({reportDS, currentSubject}) {
    // var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var papserStudentsByScore = _.groupBy(currentPaperStudentsInfo, 'score');
    var papserStudentsByScoreInfo = _.map(papserStudentsByScore, (v, k) => {
        return {
            score: k,
            students: v
        }
    });
    var orderedPaperStudentScoreInfo = _.orderBy(papserStudentsByScoreInfo, ['score'], 'desc');
    var rankTopStudentsArr = _.take(orderedPaperStudentScoreInfo, 10);
    var rankTopStudents = [];
    _.each(rankTopStudentsArr, (sarr) => {
        rankTopStudents = _.concat(rankTopStudents, sarr);
    });
    return (
        <div>
            <div>待填充</div>
            <ClassImportStudents examStudentsInfo={currentPaperStudentsInfo} />
        </div>
    )
}


