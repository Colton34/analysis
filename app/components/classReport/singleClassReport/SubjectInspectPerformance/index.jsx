import _ from 'lodash';
import React from 'react';

import DropdownList from '../../../../common/DropdownList';
import ExamInspect from './subjectPerformance-ExamInspect';
import QuestionLevel from './subjectPerformance-QuestionLevel';
import QuestionAbility from './subjectPerformance-QuestionAbility';
// import QuestionTopic from './subjectPerformance-QuestionTopic';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var subjects = [{value:'语文'},{value:'数学'}, {value:'物理'}, {value:'英语'}];
var questionPerformance = {good: ['T1', 'T2', 'T5', 'T9'], bad: ['T10', 'T12', 'T13']};
var sub='语文';//替换为当前科目

export default function SubjectInspectPerformance({reportDS, currentClass}) {
    return (
        <div id='subjectInspectPerformance' className={commonClass['section']}>
            <div style={{ marginBottom: 30 ,position:'relative'}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科考试内在表现</span>
                <span className={commonClass['title-desc']}>相对于本班的自身水平，学科有表现较好的试题和表现不足的试题</span>

                <span className={commonClass['button']} style={{width: 132, height: 34, lineHeight: '34px', background: colorsMap.B03, color: '#fff', borderRadius: 3, float:'right', cursor: 'pointer'}}>
                    <i className='icon-download-1'></i>下载题目得分表
                </span>
                <DropdownList style={{float: 'right', marginRight: 10,position:'absolute',right:'130px',top:'0px'}} list={subjects} surfaceBtnStyle={{width: 100, height: 34}}/>
            </div>
            <div style={{marginBottom: 30, zIndex: 0}}>
                <Card title={questionPerformance.good.join(' ')} titleStyle={{color: colorsMap.B04}} desc={'表现较好的题目'} style={{marginRight: 20}}/>
                <Card title={questionPerformance.bad.join(' ')} titleStyle={{color: colorsMap.B08}} desc={'表现较不足的题目'}/>
            </div>
            <div >
              <span>下图是本次考试，{sub}学科所有试题区分度/难度的表现分布情况，其中通过柱形图重点展示出表现较好和表现不足的部分试题。</span>
              <ul style={{paddingLeft:15}}>
                <li style={{paddingLeft:0,marginTop:'5px',fontSize:'14px',color:'#6a6a6a'}}>绿色柱行图表示题目表现较好，该题目本班的得分率高于全年级的平均得分率。图形高度表示高于的大小.</li>
                <li style={{paddingLeft:0,fontSize:'14px',color:'#6a6a6a'}}>红色柱形图表示题目表现不足，该题目本班的得分率低于全年级的平均得分率。图形高度表示低于的大小.</li>
              </ul>
            </div>
             <ExamInspect reportDS={reportDS} currentClass={currentClass} />

            {/* <QuestionTopic/>  */}

          
            <div style={{marginTop: 30}}>
                <QuestionLevel />
                <QuestionAbility />
            </div>
        </div>
    )
}

const Card = ({title, desc, style, titleStyle}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 560,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({lineHeight: '40px', fontSize: 32, marginTop: 15, width: 560}, localStyle.lengthControl, titleStyle ? titleStyle : {})}
                    title={title}
                    >
                    {title}
                </p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}
var localStyle = {
    card: {
        display: 'inline-block', width: 560, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    },
    lengthControl: {
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
    }
}
