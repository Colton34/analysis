import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
export default class SubjectCompare extends React.Component {
    constructor(props) {
        super(props);

    }
    render(){
        var config={
            chart: {
                type: 'column'
            },
            title: {
                text: '',
                floating:true,
                x:-485,
                y:3,
                style:{
                  "color": "#767676",
                   "fontSize": "12px"
                }
            },
            xAxis:{
                tickWidth:'0px',
                categories: subjects,
                title:{
                    align:'high',
                    text:'科目',
                    margin:0,
                    offset:7
            }},
            yAxis: {
              allowDecimals:true,//刻度允许小数
              lineWidth:1,
                gridLineDashStyle:'Dash',
                  gridLineColor:'#f2f2f3',
                title: {
                    text: ''
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#f2f2f3'
                }],
            },
            credits:{
                enabled:false
            },
            plotOptions: {
               column: {
                   pointWidth:16,//柱宽
               }
           },
            legend:{
                enabled:true,
                align:'center',
                verticalAlign:'top'
            },
            tooltip:{
                enabled:true,
                backgroundColor:'#000',
                borderColor:'#000',
                style:{
                    color:'#fff'
                },
                formatter: function(){
                    return this.point.y
                }
            },
            series:[
                {
                    name:'个人成绩排名率VS平均成绩排名率',
                    data: data
                }
            ]
        };


    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科强弱对比分析</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{display: 'inline-block', width: 1140, height: 290, position: 'relative'}}>
                <ReactHighcharts config={config} style={{width: '100%', height: '100%'}}></ReactHighcharts>
            </div>
            <span style={{color:'#333'}}>注：个人成绩排名率指自己所在学科成绩分数的名次/总人数，平均成绩排名率，指该学科平均分所在的名次/总人数。上述可表示学生各学科处于年级
            平均分之上多少或者低于多少。蓝色表示学生学科成绩比较好，高度越高，成绩越好。红色代表学生学科成绩需注意提高，高度越高，越需要学生注意。</span>
        </div>
    )
    }
}
var subjects = ['语文','数学','英语','物理','化学'];
var data = [0.3,0.4,-0.4,-0.5,-0.9];
