//临界生群体分析
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import {NUMBER_MAP as numberMap} from '../../../lib/constants';
import {makeSegmentsCountInfo} from '../../../api/exam';

import commonClass from '../../../common/common.css';

var COLOR_CONSTANT = ['#0099ff', '#33cc33', '#33cccc'];

//临界生的信息，临界生各学科平均分；分档线各学科分档分
//TODO:当只有一个学科的时候，显示没有可比性

export default  function CriticalStudent({classStudents, reportDS}) {
    var examInfo = reportDS.examInfo.toJS(), levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS(), levelBuffers = reportDS.levelBuffers.toJS();

    var {xAxis, criticalStudentInfo} = getDS(classStudents, examInfo, levels, levelBuffers);
    var tableDS = getTableDS(xAxis, criticalStudentInfo, levels, subjectLevels);
    var summaryInfo = getSummaryInfo(tableDS);

//TODO:废弃！！！
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

function getDS(classStudents, examInfo, levels, levelBuffers) {
    var xAxis = makeChartXAxis(levels);
    var criticalStudentInfo = makeCriticalStudentsInfo(classStudents, examInfo, levels, levelBuffers);
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

function makeCriticalStudentsInfo(classStudents, examInfo, levels, levelBuffers) {
    var criticalLevelInfo = {};
    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCountsInfoArr = makeSegmentsCountInfo(classStudents, segments);
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

/*
每一档：
{
    levelTitle: <String>
    studentNames: ['xxx', 'xxx', ...],
    criticalMeans: [xx, xx, ..]
    levelScores: [xx, xxx, ...]
    subjectNames: [xx, xx, xx...]
}
*/
function getTableDS(xAxis, criticalStudentInfo, levels, subjectLevels) {
    //criticalStudentsInfo和xAxis是反转后的数据，subjectLevels和levels没有反转
    var levelLastIndex = _.size(criticalStudentInfo) - 1;
    return _.map(xAxis, (levelName, index) => {
        var obj = {};
        obj.levelTitle = levelName;
        var criticalStudents = criticalStudentInfo[index];
        obj.studentNames = _.map(criticalStudents, (obj) => obj.name);
        var criticalTotalScoreMean = (criticalStudents.length == 0) ? 0 : _.round(_.mean(_.map(criticalStudents, (obj) => obj.score)), 2);
        var criticalMeans = [];
        criticalMeans.push(criticalTotalScoreMean);
        var subjectLevelInfo = subjectLevels[levelLastIndex - index];
        var subjectNames = _.map(subjectLevelInfo, (subjectInfoObj, paperId) => subjectInfoObj.name);
        subjectNames.unshift('总分');
        obj.subjectNames = subjectNames;
        var criticalSubjectMeans = getCriticalSubjectMeans(criticalStudents, subjectLevelInfo);
        criticalMeans = _.concat(criticalMeans, criticalSubjectMeans);
        var levelScores = [];
        levelScores.push(levels[levelLastIndex - index].score);
        levelScores = _.concat(levelScores, _.map(subjectLevelInfo, (subjectInfoObj, paperId) => subjectInfoObj.mean));
        obj.criticalMeans = criticalMeans;
        obj.levelScores = levelScores;
        return obj;
    })
}

function getCriticalSubjectMeans(criticalStudents, subjectLevelInfo) {
    if(criticalStudents.length == 0) return _.map(subjectLevelInfo, (subjectInfoObj, paperId) => 0);
    return _.map(subjectLevelInfo, (subjectInfoObj, paperId) => {
        var criticalSubjectScores = _.map(criticalStudents, (stuObj) => {
            var targetPaper = _.find(stuObj.papers, (obj) => obj.paperid == paperId);
            return targetPaper.score;
        });
        return _.round(_.mean(criticalSubjectScores), 2);
    });
}

function getSummaryInfo(tableDS) {
//每一档次：
//  obj.criticalMeans, levelScores, subjectNames -- 去掉'总分' -- 如果只有一个学科则显示没有可以比性--返回一个String，而不是一个obj {better: , worse: }
    return _.map(tableDS, (obj, index) => {
        //如果有两个以上的科目则返回obj={better: , worse: }，否则只有一个科目则返回String:没有可比性
        var criticalMeans = _.slice(obj.criticalMeans, 1), levelScores = _.slice(obj.levelScores, 1), subjectNames = _.slice(obj.subjectNames, 1);
        if(subjectNames.length <= 1) return '只有一个学科没有可比性';
        var temp = _.map(subjectNames, (sname, index) => {
            return {
                diff: _.round(_.divide(criticalMeans[index], levelScores[index]), 2),
                subject: sname
            }
        });
        temp = _.sortBy(temp, 'diff');
        return {
            better: _.last(temp).subject,
            worse: _.first(temp).subject
        }
    });
}










