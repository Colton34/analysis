//临界生群体分析
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import {NUMBER_MAP as numberMap} from '../../../lib/constants';
import {makeSegmentsCountInfo} from '../../../api/exam';

import commonClass from '../../../common/common.css';

var COLOR_CONSTANT = ['#0099ff', '#33cc33', '#33cccc'];

export default  function CriticalStudent({reportDS, currentClass}) {
    var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS(), levelBuffers = reportDS.levelBuffers.toJS();
    var {xAxis, criticalStudentInfo} = getDS(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass);
    var chartDS = getChartDS(criticalStudentInfo);
    var levelBufferInfo = getLevelBufferInfo(levelBuffers, levels);

    var config={
        chart: {
            type: 'column'
        },
        title: {
            text: '',
        },
        subtitle: {
            text: '(人数)',
            floating:true,
            x:-515,
            y:7,
            style:{
              "color": "#767676",
               "fontSize": "12px"
            }
        },
        xAxis: {
          tickWidth:'0px',//不显示刻度
            categories: xAxis,//TODO:动态数据
        },
        yAxis: {
          allowDecimals:false,
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
               stacking: 'normal',//柱体堆叠
               pointWidth:16,//柱宽
               dataLabels: {
                   enabled: true,
                   color: '#000',
                   style: {
                       fontWeight: 'bold'
                   },
                   inside:false,
                   formatter: function() {
                       return this.point.y+'人' ;
                   }
               }
           }
       },
        series: chartDS,
        tooltip:{
            enabled:true,
            backgroundColor:'#000',
            borderColor:'#000',
            style:{
                color:'#fff'
            },
            formatter: function(){
                return this.point.studentList
            }
        },
    };
    return (
         <div id='criticalStudent' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>临界生群体分析</span>
            <span className={commonClass['title-desc']}>本次考试的临界分值设置为：{levelBufferInfo}，若需修改请直接联系本校管理者。下图为班级本次考试临界生情况，这部分学生应给予更多关注，对整体教学成就有显著的积极作用。</span>
            <ReactHighcharts config={config} style={{width: '100%', height: '400px'}}></ReactHighcharts>
        </div>
    )
}

//=================================================  分界线  =================================================

function getDS(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass) {
    var xAxis = makeChartXAxis(levels);
    var criticalStudentInfo = makeCriticalStudentsInfo(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass);
    return {
        xAxis: xAxis,
        criticalStudentInfo: criticalStudentInfo
    }
}

function getChartDS(criticalStudentInfo) {
    if(_.size(criticalStudentInfo) > 5) return;
    var series = [], temp = [];
    var data = _.map(criticalStudentInfo, (studentArr, index) => {
        var studentList = _.join(_.map(studentArr, (stuObj) => stuObj.name), '，');
        return {
            studentList: studentList,
            y: studentArr.length,
            color: COLOR_CONSTANT[index]
        }
    });
    temp.data = data;
    series.push(temp);
    return series;
}

function getLevelBufferInfo(levelBuffers, levels) {
    var levelLastIndex = _.size(levels) - 1;
    var tempArr = _.map(levels, (levObj, levelKey) => {
        return numberMap[levelKey-0+1]+'档'+levelBuffers[levelLastIndex-levelKey]+'分';
    });
    return _.join(tempArr, '、');
}

function makeChartXAxis(levels) {
    return _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index+1] + '档临界生人数';
    });
}

function makeCriticalStudentsInfo(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers, currentClass) {
    var criticalLevelInfo = {}, currentClassStudents = studentsGroupByClass[currentClass];
    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCountsInfoArr = makeSegmentsCountInfo(studentsGroupByClass[currentClass], segments);
    var classRow = _.filter(classCountsInfoArr, (countInfo, index) => (index % 2 == 0));//从低到高
    classRow = _.reverse(classRow); //从高到底

    _.each(classRow, (arr, index) => {
        criticalLevelInfo[index] = arr;//这里是反转后的数据。
    });

    return criticalLevelInfo;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}
