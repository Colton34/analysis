// 历史表现比较：按标准分比较
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import {
    CHART_COLOR as chartColor
} from '../../../../lib/constants';

var config={
    chart: {
        type: 'column'
    },
    title: {
        text: '(标准分)',
        floating:true,
        x:-510,
        y:43,
        style:{
            "color": "#767676",
            "fontSize": "12px"
        }
    },
    subtitle: {
        text: '按标准分比较',
        floating:true,
        x:-520,
        y:20,
        style:{
            "color": "#000",
            "fontSize": "14px"
        }
    },
    xAxis: {
        tickWidth:'0px'//不显示刻度
    },
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
    legend:{
        enabled:true,
        align:'center',
        verticalAlign:'top'
    },
    plotOptions: {
        column: {
            pointWidth:16,//柱宽
        }
    },
    tooltip:{
        enabled:false,
        backgroundColor:'#000',
        borderColor:'#000',
        style:{
            color:'#fff'
        },
        formatter: function(){
            return this.series.name+':'+this.point.y+'人'
        }
    },
};

export default function StandardScoreContrast({currentClassExamsZScore, categories}) {
    var categorieSubjects = _.map(categories, (obj) => obj.subject);
    var seriesData = getSeriesData(currentClassExamsZScore, categories);
    config.xAxis.categories = categorieSubjects;
    config.series = seriesData;
    return (
       <ReactHighcharts config={config} style={{width: '100%', height: '400px'}}></ReactHighcharts>
    )
}

function getSeriesData(currentClassExamsZScore, categories) {
    var data, target, index = 0;
    return _.map(currentClassExamsZScore, (zObj, examid) => {
        data = _.map(categories, (obj) => {
            target = _.find(zObj.examZScore, (zsObj) => zsObj.subject == obj.subject);
            return (target) ? parseFloat(target.zScore) : 'undefined'
        });
        var tempColor = chartColor[index % 5];
        index++;
        return {
            name: zObj.name,
            color: tempColor,
            data: data
        }
    });
}


/*
Mock Data:
[
        {
            name:'第一次期中考试',
            color:'#0099ff',
            data:[0.1,-0.2,-0.2,0.3,0.4,0.5,0.6,-0.2,-0.1,0.2],
        },{
            name:'第二次期中考试',
            color:'#33cccc',
            data:[0.1,0.3,-0.9,0.8,0.7,0.6,-0.5,0.4,0.3,0.3],
        }
    ],

categories: ['语文','数学','英语','政治','地理','历史','化学','物理','生物','语文'],

 */
