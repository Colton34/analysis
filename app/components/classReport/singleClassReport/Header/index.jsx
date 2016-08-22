import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from './ModuleNav';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var examInfo = {
    "lostClasses":[],"gradeName":"高三","subjects":["数学","数学","语文","英语","文综","理综"],
    "realClasses":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"],
    "name":"15-16下学期高三保温考试","startTime":1464307200000,
    "lostStudentsCount":192,"realStudentsCount":1009,"fullMark":1200
}

export default function ReportHeader({examInfo, currentClass}) {
    var examInfo = examInfo.toJS();
    return (
        <div>
            <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                <p style={{ fontSize: 18 }}>{examInfo.gradeName + currentClass + '班班级分析诊断报告'}</p>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <HeaderInfo examInfo={examInfo} currentClass={currentClass}/>
                <ModuleNav/>
            </div>
        </div>
    )
}
