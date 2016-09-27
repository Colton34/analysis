import _ from 'lodash';
import React, { PropTypes } from 'react';

import Header from './Header';
import Trender from './TotalScoreTrend';
import TotalScoreDisModule from './TotalScorelevelDis';
import ImportStudentsModule from './importStudents';
import SubjectPerformance from './SubjectPerformance';
import SubjectLevelDistribution from './SubjectLevelDistribution';
import CriticalStudentModule from './CriticalStudent';

export default function MultiSchoolReport({reportDS, examId, grade, user}) {
    return (
        <div>
            <Header reportDS={reportDS} user={user} />
            <Trender reportDS={reportDS} />
            <TotalScoreDisModule reportDS={reportDS} examId={examId} grade={grade} />
            <SubjectLevelDistribution reportDS={reportDS}/>
            <CriticalStudentModule reportDS={reportDS} examId={examId} grade={grade} />
            <SubjectPerformance reportDS={reportDS}/>
            <ImportStudentsModule reportDS={reportDS}/>
        </div>
    )
}
