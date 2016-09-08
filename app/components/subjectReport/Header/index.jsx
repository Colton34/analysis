import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from '../../../common/ModuleNav';

import {COLORS_MAP as colorsMap} from '../../../lib/constants';

var modules = [
    {
        name: '考试基本情况',
        id: 'totalScoreTrend'
    }, {
        name: '学科分档上线情况',
        id: 'subjectLevel'
    }, {
        name: '分档临界生情况',
        id: 'subjectCritical'
    }, {
        name: '学科教学质量分析',
        id: 'subjectQuality'
    }, {
        name: '试卷整体命题及考试表现',
        id: 'examQuestionPerformance'
    }, {
        name: '重点学生信息',
        id: 'importantStudents'
    }
];

export default function ReportHeader({reportDS, currentSubject}) {

var examInfo = reportDS.examInfo.toJS();

    return (
        <div>
            <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                <p style={{ fontSize: 18 }}>{currentSubject.subject}-学科分析诊断报告</p>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <HeaderInfo reportDS={reportDS} currentSubject={currentSubject} />
                <ModuleNav modules={modules} />
            </div>
        </div>
    )
}

