import _ from 'lodash';
import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from './ModuleNav';

import commonClass from '../../../../common/common.css';
export default function ReportHeader({examInfo}) {
    return (
        <div className={commonClass['section']} style={{position: 'relative', zIndex: 2}}>
            <HeaderInfo examInfo={examInfo} />
            <ModuleNav/>
        </div>
    )
}
