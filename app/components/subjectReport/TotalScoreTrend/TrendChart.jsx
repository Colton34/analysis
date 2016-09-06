import _ from 'lodash';
import React from 'react';
import ReactHighcharts from 'react-highcharts';

import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import {makeSegmentsDistribution, makeSegments} from '../../../sdk';

export default function TrendChart({currentPaperInfo, currentPaperStudentsInfo}) {

    var chartDS = getChartDS(currentPaperInfo.fullMark,currentPaperStudentsInfo);
    var config = {
        colors: ['#00adfb'],//折现颜色
        title: {//y轴标签    改
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
            categories:chartDS['x-axon'],
            title:{//x轴标签
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
                return (this.point.low > 0 ? '(' : '[') + this.point.low + '-' + this.point.high + ']区间人数<br />' + this.point.y + '人,占'
                    + Math.round(((this.point.y / currentPaperStudentsInfo.length) * 100)) + '%';
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
            data:chartDS['y-axon']
        }],
        credits: {
            enabled: false
        }
    }
    return (
        <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
    )
}


function getChartDS(currentPaperFullMark, currentPaperStudents) {
    var segments = makeSegments(currentPaperFullMark);
    var xAxons = _.slice(segments, 1);
    var segmentDistribution = makeSegmentsDistribution(segments, currentPaperStudents, 'score');
    var yAxons = getYAxonsDS(segmentDistribution, xAxons);
    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}


function getYAxonsDS(segmentDistribution) {
    return _.map(segmentDistribution, (obj, index) => {
        var temp = _.pick(obj, ['low', 'high']);
        if(index == 0) temp.first = true;
        temp['y'] = obj.count;
        return temp;
    });
}
