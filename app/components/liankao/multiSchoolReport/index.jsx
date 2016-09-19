import _ from 'lodash';
import React, { PropTypes } from 'react';

import Header from './Header';
import Trender from './TotalScoreTrend';
import ImportStudentsModule from './importStudents';
export default function MultiSchoolReport({reportDS}) {
    return (
        <div>
            <Header examInfo={reportDS.examInfo} />
            <Trender reportDS={reportDS} />
            <ImportStudentsModule reportDS={reportDS}/>
        </div>
    )
}
