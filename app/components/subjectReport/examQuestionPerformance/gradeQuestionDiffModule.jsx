import _ from 'lodash';
import React, { PropTypes } from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import ReactHighcharts from 'react-highcharts';

export default function GradeQuestionDiffModule({paperQuestionsDiffInfo, gradeQuestionSeparation}) {
    var chartDS = getChartDS({paperQuestionsDiffInfo, gradeQuestionSeparation});
    var summaryInfo = getSummaryInfo(chartDS);
    debugger;
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
        <div >
            <div style={{marginBottom: 18,marginTop:30}}>
                <span className={commonClass['sub-title']}>年级试题难度-区分度分布图</span>
                <span className={commonClass['title-desc']}>将每一个试题的难度，区分度结合起来分析</span>
            </div>
            <ReactHighcharts config={config} style={{marginTop: 30, width: '100%', height: 330}}/>
            <div className={commonClass['analysis-conclusion']} style={{display:summaryInfo==''?'none':'block'}}>
                <p>分析诊断：</p>
                <div>
                    从试题的测试功能看，试题 <span style={{color:'#0099ff'}}>{summaryInfo}</span>  需要进一步审视试题的难度设置。
                </div>
            </div>
        </div>
    )
}


function getChartDS({paperQuestionsDiffInfo, gradeQuestionSeparation}){
     var chartDS = _.map(_.range(_.size(paperQuestionsDiffInfo)),function(index){
        return {
            name:paperQuestionsDiffInfo[index].name,
            y:paperQuestionsDiffInfo[index].diff,
            x:gradeQuestionSeparation[index]
        }
    });
    return chartDS;
}

function getSummaryInfo(chartDS){
     var summaryInfo = _.filter(chartDS,function(obj){
        return 0<obj.x<=0.2&&obj.y<=0.4
    });
     var summaryInfoString = _.map(summaryInfo,(obj) => {return obj.name})
    return summaryInfoString.join('   ');
}
