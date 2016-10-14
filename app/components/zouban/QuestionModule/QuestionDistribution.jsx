import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
export default function QuestionDistribution(){
    var config = {
      title: {
        text: '(得分率)',
        floating: true,
        x: -510,
        y: 5,
        style: {
          "color": "#767676",
          "fontSize": "12px"
        }
      },
      subtitle: {
        text: '(区分度)',
        floating: true,
        x: 520,
        y: 300,
        style: {

          "color": "#767676",
          "fontSize": "12px"
        }
      },
      legend: {//图例组件
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        gridLineColor: colorsMap.C03,
        gridLineDashStyle: 'Dash',
        gridLineWidth: 1,
        lineColor: colorsMap.C03,//轴线颜色
        lineWidth: 1,
        tickLength: 0,//刻度长度
        startOnTick: true,
        endOnTick:true,
        max: 1,//最大
        min:0,
        minTickInterval: 0.2,//刻度最小间隔
      },
      yAxis: {
        allowDecimals: true,//刻度允许小数
        lineWidth: 1,
        gridLineDashStyle: 'Dash',
        gridLineColor: colorsMap.C03,
        title: {
          text: ''
        },

      },
      tooltip: {
        backgroundColor: '#000',
        borderColor: '#000',
        style: {
          color: '#fff'
        },
        formatter: function () {
          return (
            '<b>' + this.point.name + '</b><br />'
            + '得分率：' + this.point.y + '<br />区分度：' + this.point.x
          )
        },
      },
      series: [{
        type: 'scatter',
        data: chartDS,
        color: '#0099ff'
        }]
    };

    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>试题难度-区分度分布图</span>
            <span className={commonClass['title-desc']}>将每一个试题的难度，区分度结合起来分析</span>
            <div style={{marginTop:30}}>
            <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
            </div>
        </div>
    )
}
//mork 数据
var chartDS = [{
    name:'第一题',
    x:0.26,
    y:0.45
},
{
    name:'第一题',
    x:0.34,
    y:0.45
},
{
    name:'第一题',
    x:0.12,
    y:0.23
},
{
    name:'第一题',
    x:0.56,
    y:0.12
},
{
    name:'第一题',
    x:0.23,
    y:0.78
},
{
    name:'第一题',
    x:0.78,
    y:0.9
},
{
    name:'第一题',
    x:0.78,
    y:0.9
},
{
    name:'第一题',
    x:0.67,
    y:0.78
},
{
    name:'第一题',
    x:0.56,
    y:0.34
}];
