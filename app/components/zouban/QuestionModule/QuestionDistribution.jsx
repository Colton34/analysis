import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ReactHighcharts from 'react-highcharts';
export default function QuestionDistribution({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}){
    var chartDS = getChartData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo);
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
            <ReactHighcharts config={config} style={{marginTop: 30, width: '1140px', height: '330px'}}/>
            </div>
        </div>
    )
}

function getChartData(currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo){
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
    var chartData = _.map(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var rate = question[currentClass].rate;
        return {
            name:currentLessonQuestions[index].name,
            x:question.lesson.separations,
            y:rate
        }
    });
    return chartData;
}
