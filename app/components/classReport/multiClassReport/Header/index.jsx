import _ from 'lodash';
import React from 'react';

import HeaderInfo from './HeaderInfo';
import ModuleNav from '../../../../common/ModuleNav';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var modules = [
    {
        name: '学科平均分排名',
        id: 'subjectMeanRank'
    }, {
        name: '班级成绩概况',
        id: 'classScoreGuide'
    }, {
        name: '自定义成绩登记的人数比例对比',
        id: 'customScoreLevel'
    }, {
        name: '自定义分数段的人数分布',
        id: 'customScoreSegment'
    }, {
        name: '学科小分得分率对比',
        id: 'subjectSmallScore'
    }
];

export default function ReportHeader({examInfo}) {
    var examInfo = examInfo.toJS();
    return (
        <div>
            <div style={{ width: 1200, height: 152, backgroundColor: colorsMap.B03, textAlign: 'center', color: '#fff', display: 'table-cell', verticalAlign: 'middle', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
                <p style={{ fontSize: 25, lineHeight: '30px' }}>{examInfo.name}</p>
                <p style={{ fontSize: 18 }}>班级间分析诊断报告</p>
            </div>
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <HeaderInfo examInfo={examInfo}/>
                <ModuleNav modules={modules}/>
            </div>
        </div>
    )
}
