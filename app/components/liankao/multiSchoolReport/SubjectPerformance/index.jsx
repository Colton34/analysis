import React from 'react';
import _ from 'lodash';
//styles
import commonClass from '../../../../styles/common.css';
// modules
import SchoolSubjectPerformance from './SchoolSubjectPerformance';
export default function({reportDS}) {
    return (
        <div className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科考试基本表现</span>
            </div>
            <SchoolSubjectPerformance reportDS={reportDS}/>
        </div>
    )
}