import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';
import ReactHighcharts from 'react-highcharts';

import commonClass from '../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../lib/constants';

export default function StudentSubjectCompare({zoubanLessonStudentsInfo, lessonsByStudent, currentStudent}) {
    if(_.size(currentStudent) == 0) return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科强弱对比分析</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{display:'tableCell',textAlign:'center',padding:'50px 0px'}}>
                <span>请先选择学生后查看数据</span>
            </div>
        </div>
    );
    var categories = getCategories(lessonsByStudent);
    var studentRankRateDiff = getStudentLessonRankRateDiff(zoubanLessonStudentsInfo, lessonsByStudent, currentStudent);

    var config={
        chart: {
            type: 'column'
        },
        title: {
            text: '',
            floating:true,
            x:-485,
            y:3,
            style:{
              "color": "#767676",
               "fontSize": "12px"
            }
        },
        xAxis:{
            tickWidth:'0px',
            categories: categories,
            title:{
                align:'high',
                text:'科目',
                margin:0,
                offset:7
        }},
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
        plotOptions: {
           column: {
               pointWidth:16,//柱宽
           }
       },
        legend:{
            enabled:true,
            align:'center',
            verticalAlign:'top'
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
        series:[
            {
                name:'个人成绩排名率VS平均成绩排名率',
                data: studentRankRateDiff
            }
        ]
    };

    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科强弱对比分析</span>
            <span className={commonClass['title-desc']}></span>
            <div style={{display: 'inline-block', width: 1140, height: 290, position: 'relative'}}>
                <ReactHighcharts config={config} style={{width: '100%', height: '100%'}}></ReactHighcharts>
            </div>
            <span style={{color:'#333'}}>注：个人成绩排名率指自己所在学科成绩分数的名次/总人数，平均成绩排名率，指该学科平均分所在的名次/总人数。上述可表示学生各学科处于年级平均分之上多少或者低于多少。蓝色表示学生学科成绩比较好，高度越高，成绩越好。红色代表学生学科成绩需注意提高，高度越高，越需要学生注意。</span>
        </div>
    )
}

function getCategories(lessonsByStudent) {
    return _.map(lessonsByStudent, (obj) => obj.name);
}

function getStudentLessonRankRateDiff(zoubanLessonStudentsInfo, lessonsByStudent, currentStudent) {
    var currentLessonStudents, targetStudent, studentRankRate, lessonMean, gradeTargetStudent;
    return _.map(lessonsByStudent, (lessonObj) => {
        currentLessonStudents = _.unionBy(..._.values(zoubanLessonStudentsInfo[lessonObj.objectId]), (obj) => obj.id);
        targetStudent = _.find(currentLessonStudents, (obj) => obj.id == currentStudent.value);
        studentRankRate = _.round(_.divide(targetStudent.lessonRank, currentLessonStudents.length), 2);

        lessonMean = _.round(_.mean(_.map(currentLessonStudents, (obj) => obj.score)), 2);
        gradeTargetStudent = _.chain(currentLessonStudents).map((obj) => {
            return {
                diff: Math.abs(obj.score-lessonMean),
                value: obj
            }
        }).sortBy('diff').first().value().value;
        var gradeRankRate = _.round(_.divide(gradeTargetStudent.lessonRank, currentLessonStudents.length), 2);
        return _.round(_.subtract(studentRankRate, gradeRankRate), 2);
    });
}



//各个学科所参加考试的人数
//当前学生在所考的各个学科中的名次
//各个学科的平均分，此平均分所对应的排名--各个学生所对应的分数和此平均分的绝对值，绝对值最小的即为target
