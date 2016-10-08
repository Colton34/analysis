import _ from 'lodash';
import React from 'react';
import ReactHighcharts from 'react-highcharts';

import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default function TrendChart({chartDS, examInfo,classStudents}) {
    var config = {
        colors: ['#00adfb'],
        title: {
            text: '(人数)',
            floating: true,
            x: -515,
            y: 5,
            style: {
                "color": "#767676",
                "fontSize": "12px"
            }

        },
        xAxis: {
            tickWidth: '0px',//不显示刻度
            categories: chartDS['x-axon'],
            title:{
                align:'high',
                text:'分数段',
                margin:0,
                offset:7
            }
        },
        yAxis: {
            allowDecimals:false,//不允许为小数
            lineWidth: 1,
            gridLineDashStyle: 'Dash',
            gridLineColor: '#f2f2f3',
            title: {
                text: '',
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#f2f2f3'
            }]
        },
        tooltip: {
            backgroundColor: '#000',
            borderColor: '#000',
            style: {
                color: '#fff'
            },
            formatter: function () {
                return '[' + this.point.low + '-' + this.point.high + (this.point.x == chartDS['x-axon'].length-1 ? ']' : ')') + '区间人数<br />' + this.point.y + '人,占'
                    + Math.round(((this.point.y / classStudents.length) * 100)) + '%';
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0,
            enabled: false
        },
        series: [{
            name: 'school',
            data: chartDS['y-axon']
        }],
        credits: {
            enabled: false
        }
    }
    return (
        <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
    )
}
