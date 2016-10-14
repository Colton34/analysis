import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
export default function QuestionDetail() {
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>每小题得分情况</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{marginTop:30}}>
            <TableView hover  tableData={tableData}></TableView>
            </div>
        </div>
    )
}


//mork 表格数据
var tableData = [
    ['题号','满分','最低分','最高分','平均分','得分率','难度','查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题'],
    ['第一题',100,0,99,79,0.8,0.6,'查看原题']];

// class lookQuestion extends React.Component{
//     render(){
//         return(
//             <a>查看原题</a>
//         )
//     }
// }
