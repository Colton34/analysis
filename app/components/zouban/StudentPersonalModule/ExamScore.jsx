import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
export default class ExamScore extends React.Component {
    constructor(props) {
        super(props);

    }
    render(){
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>考试基本成绩分数</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{width:'1140px',padding:'10px 0',display:'table-cell',textAlign:'center'}}><span>{'张萌同学'}</span></div>
            <div style={{marginBottom:20}}>
            <TableView hover  tableData={tableData}></TableView>
            </div>
            <span style={{color:'#333'}}>说明：比如全校某年级100人，处于年级20%得分的含义是处于第20名的同学，表格中显示该同学的总分及各科分数，方便学生和不同等级的同学进行对比。</span>

        </div>
    )
    }
}

var tableData = [
    ['姓名','总分','语文','数学','英语'],
    ['本人成绩',110,30,30,50],
    ['年级排名',110,30,30,50],
    ['超过年级',110,30,30,50],
    ['年级平均分',110,30,30,50],
    ['年级最高分',110,30,30,50],
    ['处于年级20%得分',110,30,30,50],
    ['处于年级40%得分',110,30,30,50],
    ['处于年级60%得分',110,30,30,50],
    ['处于年级80%得分',110,30,30,50],
    ['查看原卷','---','查看原卷','查看原卷','查看原卷']
];
