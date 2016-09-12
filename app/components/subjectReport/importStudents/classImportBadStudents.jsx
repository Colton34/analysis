import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap,NUMBER_MAP as numberMap,} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import ReactHighcharts from 'react-highcharts';

export default function ClassImportBadStudents({currentPaperStudentsInfo}) {
    var studentsNum = _.round(_.size(currentPaperStudentsInfo)*0.2);
    var allStudentGroupByNum = getBadStudent(currentPaperStudentsInfo);
    var chartDS = getChartDS(allStudentGroupByNum,currentPaperStudentsInfo);
    var config={
        chart: {
            type: 'column'
        },
        title: {
            text: '(人数)',
            floating:true,
            x:-510,
            y:13,
            style:{
                "color": "#767676",
                "fontSize": "12px"
            }
        },
        subtitle: {
            text: '',
            floating:false,
            x:-520,
            y:20,
            style:{
                "color": "#000",
                "fontSize": "14px"
            }
        },
        xAxis: {
            tickWidth:'0px',//不显示刻度
            title:{
                align:'high',
                text:'班级',
                margin:0,
                offset:7
            },
            categories:chartDS.xAxis
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
            enabled:false,
            align:'center',
            verticalAlign:'top'
        },
        plotOptions: {
            column: {
                pointWidth:16,//柱宽
            }
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
        series:[{
            data:chartDS.seriesData,
            color:'#0099ff'
        }]
    };

return (
    <div>
        <div style={{margfinBottom: 30,marginTop:30}}>
            <span className={commonClass['sub-title']}>全年级本学科分数排名在后20%的学生总人数为 {studentsNum} ，在各班的分布情况如下图：</span>
            <span className={commonClass['title-desc']}></span>
        </div>
        <div style={{marginTop:30}}>
            <ReactHighcharts config={config} style={{ width: '100%', height: '400px'}}></ReactHighcharts>
        </div>
    </div>
)
}

function getBadStudent(currentPaperStudentsInfo){
     var allStudent = _.take(currentPaperStudentsInfo,_.round(_.size(currentPaperStudentsInfo)*0.2))//前20
     var allStudentGroupBy = _.groupBy(allStudent,'class_name');
     var allStudentGroupByNum = _.map(allStudentGroupBy,function(value,key){
         return {
             name:key+'班',
             y:_.size(value)
         }
     });
     return allStudentGroupByNum;
}

function getChartDS(allStudentGroupByNum,currentPaperStudentsInfo){
    var xAxis = _.map(_.groupBy(currentPaperStudentsInfo,'class_name'),function(value,key){
        return key+'班';
    });

    var seriesData = _.map(xAxis,function(obj){
        var result = _.find(allStudentGroupByNum,function(object){
        return object.name==obj;
    });
        return {
            name:obj,
            y:result?result.y:0
                }
    })
        return {
            xAxis:xAxis,
            seriesData:seriesData
        }
}
