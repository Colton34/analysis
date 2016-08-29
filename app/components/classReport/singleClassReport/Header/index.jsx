import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from '../../../../common/ModuleNav';

import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var modules = [
    {
        name: '总分分布趋势',
        id: 'totalScoreTrend'
    }, {
        name: '总分分档学生人数分布',
        id: 'levelDistribution'
    }, {
        name: '学科分档人数分布',
        id: 'scoreLevel'
    }, {
        name: '临界生群体分析',
        id: 'criticalStudent'
    }, {
        name: '学科考试表现分析',
        id: 'subjectPerformance'
    }, {
        name: '学科考试内在表现',
        id: 'subjectInspectPerformance'
    }, {
        name: '重点学生信息',
        id: 'studentInfo'
    }, {
        name: '历史表现比较',
        id: 'historyPerformance'
    }
];

export default function ReportHeader({examInfo, examClassesInfo, classHeaders, currentClass}) {
    var examInfo = examInfo.toJS();
    var currentExamClassInfo = examClassesInfo.toJS()[currentClass];
    var subjects = _.map(classHeaders, (headerObj) => headerObj.subject);
    return (
        <div>
            <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                <p style={{ fontSize: 18 }}>{examInfo.gradeName + currentClass + '班班级分析诊断报告'}</p>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <HeaderInfo examInfo={examInfo} currentExamClassInfo={currentExamClassInfo} subjects={subjects} currentClass={currentClass}/>
                <ModuleNav modules={modules}/>
            </div>
        </div>
    )
}
