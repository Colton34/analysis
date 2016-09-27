import _ from 'lodash';
import React from 'react';

import HeaderInfo from './HeaderInfoModule';
import ModuleNav from '../../../../common/ModuleNav';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var modules = [
    {
        name: '总分分布',
        id: 'totalScoreTrend'
    }, {
        name: '总分分档上线人数分布',
        id: 'scoreDistribution'
    }, {
        name: '学科分档上线情况',
        id: 'subjectLevelDistribution'
    }, {
        name: '临界生群体分析',
        id: 'criticalStudent'
    }, {
        name: '学科考试表现',
        id: 'subjectPerformance'
    }, {
        name: '重点学生信息',
        id: 'importantStudents'
    }
];

export default function ReportHeader({examInfo, user}) {
    var examInfo = examInfo.toJS();
    return (
        <div>
            <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                <p style={{ fontSize: 18 }}>联考总体分析报告</p>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <HeaderInfo examInfo={examInfo} user={user} />
                <ModuleNav modules={modules}/>
            </div>
        </div>
    )
}
