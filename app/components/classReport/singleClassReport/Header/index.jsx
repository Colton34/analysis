import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from './ModuleNav';
import commonClass from '../../../../common/common.css';

export default function Header({examInfo}) {
    return (
        <div className={commonClass['section']} style={{position: 'relative'}}>
            <HeaderInfo examInfo={examInfo} />
            <ModuleNav/>
        </div>
    )
}
