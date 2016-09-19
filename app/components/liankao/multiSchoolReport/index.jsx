import _ from 'lodash';
import React, { PropTypes } from 'react';

import Header from './Header';
import Trender from './TotalScoreTrend';
import TotalScoreDisModule from './TotalScorelevelDis';

/*
            <Header examInfo={reportDS.examInfo} />
            <Trender reportDS={reportDS} />

 */


export default function MultiSchoolReport({reportDS, examId, grade}) {
    return (
        <div>
            <TotalScoreDisModule reportDS={reportDS} examId={examId} grade={grade} />

        </div>
    )
}

