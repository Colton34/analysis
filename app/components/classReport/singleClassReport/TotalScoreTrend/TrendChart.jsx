import _ from 'lodash';
import React from 'react';
import ReactHighcharts from 'react-highcharts';

import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

export default function TrendChart({chartDS, examInfo}) {
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
            categories: chartDS['x-axon']
        },
        yAxis: {
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
                return (this.point.low > 0 ? '(' : '[') + this.point.low + '-' + this.point.high + ']区间人数<br />' + this.point.y + '人,占'
                    + Math.round(((this.point.y / examInfo.realStudentsCount) * 100)) + '%';
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