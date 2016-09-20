import _ from 'lodash';
import React, { PropTypes } from 'react';

import Header from './Header';
import Trender from './TotalScoreTrend';
import TotalScoreDisModule from './TotalScorelevelDis';
import ImportStudentsModule from './importStudents';
import SubjectPerformance from './SubjectPerformance';
import SubjectLevelDistribution from './SubjectLevelDistribution';

export default function MultiSchoolReport({reportDS, examId, grade}) {
    return (
        <div>
            <Header examInfo={reportDS.examInfo} />
            <Trender reportDS={reportDS} />
            <TotalScoreDisModule reportDS={reportDS} examId={examId} grade={grade} />
            <SubjectPerformance reportDS={reportDS}/>
            <ImportStudentsModule reportDS={reportDS}/>
            <SubjectLevelDistribution reportDS={reportDS}/>
        </div>
    )
}
