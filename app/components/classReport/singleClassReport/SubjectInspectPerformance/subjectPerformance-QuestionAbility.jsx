//试题能力的结构表现: 暂时没有
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default function QuestionAbility() {
    return (
        <div style={{display: 'inline-block',float:'right'}}>
            <div style={{marginBottom: 18}}>
                <span className={commonClass['sub-title']}>试题知识点/能力点的结构表现</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <div style={{width: 560, height: 465, border: '1px solid' + colorsMap.C05, borderRadius: 2, display: 'table-cell', textAlign: 'center', verticalAlign: 'middle'}}>
                <div className={commonClass['blank-list']} style={{margin: '0 auto'}}></div>
                <p style={{color: colorsMap.C10, margin: '20px 0 0 0'}}>由于本次考试，该科目还未标定“试题能力点”</p>
                <p style={{color: colorsMap.C10}}>暂无法查看此分析内容</p>
            </div>
        </div>
    )
}


