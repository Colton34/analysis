import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
//components
import StudentCountDistribution from './CountDistribution';


export default function ({reportDS}) {
    return (
        <div className={commonClass['section']}>
            <StudentCountDistribution reportDS={reportDS}/>
        </div>
    )
}