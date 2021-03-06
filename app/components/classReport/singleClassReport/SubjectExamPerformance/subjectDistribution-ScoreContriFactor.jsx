//学科得分贡献指数
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';

import {makeFactor} from '../../../../api/exam';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import singleClassReportStyle from '../singleClassReport.css';

var config={
    chart: {
        type: 'column'
    },
    title: {
        text: '(贡献指数)',
        floating:true,
        x:-485,
        y:3,
        style:{
          "color": "#767676",
           "fontSize": "12px"
        }
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
    plotOptions: {
       column: {
           pointWidth:16,//柱宽
       }
   },
    legend:{
        enabled:false,
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
    }
};


var localStyle = {
    subjectCard: {width: 238, height: 112, border: '1px solid ' + colorsMap.C04, borderRadius: 2, display: 'table-cell', verticalAlign: 'middle', textAlign: 'center', boxShadow: '0 3px 3px' + colorsMap.C03},
    lengthControl: {
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
    },
}

export default function SubjectContriFactor({classStudents, classHeadersWithTotalScore, currentClass, reportDS}) {
    var examInfo = reportDS.examInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS();
    var {subjects, datas, headerInfo} = getDS(examInfo, examStudentsInfo, examPapersInfo, classStudents, classHeadersWithTotalScore, currentClass);
    var finalData = formatData(datas);
    config['xAxis'] = {tickWidth:'0px', categories: subjects,
    title:{
        align:'high',
        text:'科目',
        margin:0,
        offset:7
    }};
    config['series'] = [{name: '贡献指数', data: finalData}];
    return (
        <div style={{marginTop: 30}}>
            <div style={{marginBottom: 30}}>
                <span className={commonClass['sub-title']}>学科得分贡献指数</span>
                <span className={commonClass['title-desc']}>以学科得分率为基础，综合考虑了该学科对班级、学校综合水平的均衡性影响，借此分析学科对班级得分水平的贡献大小，指数值为正，是促进作用；为负，是拖后腿</span>
            </div>
            {/*-----------------柱形图----------------------- */}
            <div style={{display: 'inline-block', width: 1140, height: 290, position: 'relative'}}>
              <ReactHighcharts config={config} style={{width: '100%', height: '100%'}}></ReactHighcharts>
            </div>
            <div className={singleClassReportStyle['analysis-conclusion']}>
                <div style={{lineHeight: 1.5}}>分析诊断：</div>
                {
                    headerInfo.greater[0] !== headerInfo.lesser[0] ?  (
                        <div style={{lineHeight: 1.5}}>
                            根据上图各学科的得分率贡献指数的大小，可知本班级<span style={{color: colorsMap.B03, margin: '0 5px'}}>{headerInfo.greater}</span>学科表现对班级总分水平有较大的教学推进作用，
                            而<span style={{color: colorsMap.B03, margin: '0 5px'}}>{headerInfo.lesser}</span>学科表现对班级总分水平有较大的牵扯现象。
                        </div> ) : <div style={{lineHeight: 1.5}}>只有一个科目没有可比性。</div>
                }
            </div>
        </div>
    )
}

//=================================================  分界线  =================================================
function getDS(examInfo, examStudentsInfo, examPapersInfo, classStudents, classHeadersWithTotalScore, currentClass) {
    var subjectMeanInfo = makeClassExamMeanInfo(examInfo, examStudentsInfo, examPapersInfo, classStudents, currentClass);
    var factorsTableData = theClassExamMeanFactorsTable(subjectMeanInfo, examInfo, classHeadersWithTotalScore, currentClass);
    var {currentClassSubjectFactors, bestSubject, worstSubject} = factorsTableData;
    var subjects = _.map(currentClassSubjectFactors, (obj) => obj.subject);
    var datas = _.map(currentClassSubjectFactors, (obj) => obj.factor);
    var headerInfo = {greater: [bestSubject], lesser: [worstSubject]};
    return {
        subjects: subjects,
        datas: datas,
        headerInfo: headerInfo
    };
}

function makeClassExamMeanInfo(examInfo, examStudentsInfo, examPapersInfo, classStudents, currentClass) {
    var result = {};
    result.totalSchool = makeOriginalSubjectInfoRow(examStudentsInfo, examPapersInfo, examInfo);
    result[currentClass] = makeOriginalSubjectInfoRow(classStudents, examPapersInfo, examInfo);
    return result;
}

//一行的得分率！！！
function makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo) {
    var result = {};
    result.totalScore = {};

    result.totalScore.mean = _.round(_.mean(_.map(students, (student) => student.score)), 2);
    result.totalScore.count = _.filter(students, (student) => student.score >= result.totalScore.mean).length;
    result.totalScore.meanRate = _.round(_.divide(result.totalScore.mean, examInfo.fullMark), 2);//注意这里没有使用百分制

    result.totalScore.countPercentage = _.round(_.multiply(_.divide(result.totalScore.count, students.length), 100), 2);//注意这里使用了百分制
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};

        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.count = _.filter(papers, (paper) => paper.score >= obj.mean).length;
        obj.meanRate = _.round(_.divide(obj.mean, examPapersInfo[pid].fullMark), 2);//注意这里没有使用百分制
        obj.countPercentage = _.round(_.multiply(_.divide(obj.count, students.length), 100), 2);//注意这里使用了百分制

        result[pid] = obj;
    });
    return result;
}

/**
 * @param  {[type]} subjectMeanInfo [description]
 * @param  {[type]} classHeadersWithTotalScore         [description]
 * @return {[type]}                 [description]
 */
function theClassExamMeanFactorsTable(subjectMeanInfo, examInfo, classHeadersWithTotalScore, currentClass) {
    var orderSubjectNames = _.map(_.slice(classHeadersWithTotalScore, 1), (obj) => obj.subject);
    var originalMatrix = makeClassExamMeanOriginalMatirx(subjectMeanInfo, classHeadersWithTotalScore, currentClass);
    var currentClassFactors = makeFactor(originalMatrix)[0];//应该只剩下一行
    //这里对orderSubjectNames进行Map还是为了保证横轴是按照科目的名称进行排序显示的
    var currentClassSubjectFactors = _.map(orderSubjectNames, (subjectName, index) => {
        return {subject: subjectName, factor: currentClassFactors[index]} //应该和orderSubjectNames的数目一样多
    });
    var orderCurrentClassSubjectFactors = _.sortBy(currentClassSubjectFactors, 'factor');
    var bestSubject = _.last(orderCurrentClassSubjectFactors).subject;
    var worstSubject = _.first(orderCurrentClassSubjectFactors).subject;
    return {
        currentClassSubjectFactors: currentClassSubjectFactors,
        bestSubject: bestSubject,
        worstSubject: worstSubject
    }
}

function makeClassExamMeanOriginalMatirx(subjectMeanInfo, classHeadersWithTotalScore, currentClass) {
    var matrix = [], subjectMenaObj = subjectMeanInfo[currentClass];
    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;

    matrix.push(_.map(classHeadersWithTotalScore, (headerObj) => totalSchoolMeanObj[headerObj.id].meanRate));
    matrix.push(_.map(classHeadersWithTotalScore, (headerObj) => (subjectMenaObj[headerObj.id]) ? subjectMenaObj[headerObj.id].meanRate : '无数据'));

    return matrix;
}

function formatData(datas) {
//数据预处理
    var findata=[];
    for(let i=0;i<datas.length;i++){
        if(datas[i]>=0){
            findata[i]={
                y:datas[i],
                color:'#0099ff'
            }
        }else{
            findata[i]={
                y:datas[i],
                color:'#bfbfbf'
            }
        }
    }
    return findata;
}
