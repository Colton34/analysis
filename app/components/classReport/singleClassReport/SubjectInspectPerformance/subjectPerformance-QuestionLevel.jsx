//试题难度题组表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ECharts from 'react-echarts';
import ReactHighcharts from 'react-highcharts';

import commonClass from '../../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

var questionLevelTitles = ['容易题组', '较容易题组', '中等题组', '较难题组', '最难题组'];
var indicator = _.map(questionLevelTitles, (qt) => {
    return {
        name: qt,
        max: 1
    }
});

var option = {
    tooltip: {},
    legend: {
        data: ['年级平均得分率', '班级平均得分率'],
        right:25,
        top:25,
        orient:'vertical',
        textStyle:{
          color:'#6a6a6a'
        },
    },
    radar: {
        indicator: indicator,
        radius:150,
        splitNumber:3,//刻度数目
        axisTick:{show:false},//刻度
        axisLabel:{show:false},//刻度数字
        splitArea: {
                areaStyle: {
                    color: ['#fff',
                    '#fff', '#fff',
                    '#fff', '#fff'],
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 0
                }
            },
            name: {
           textStyle: {
               color: '#6a6a6a'
           }
       },
            splitLine: {//分割线颜色
            lineStyle: {
                color: '#f2f2f3'
            },
          },
            axisLine: {
           lineStyle: {
               color: '#f2f2f3'
           }
       }


    },
    series: [{
        name: '班级vs年级',
        type: 'radar',
        //areaStyle: {normal: {}},
        color:['#0099ff','#cccccc']
    }]
};

// var subjectPerformance={
//     high:'较难题组',
//     low:'较易题组'
// };


export default function QuestionLevel({classQuestionLevelGroupMeanRate, gradeQuestionLevelGroupMeanRate}) {
    option.series[0].data = [
        {
            value: classQuestionLevelGroupMeanRate,
            name: '班级平均得分率'
        },
        {
            value: gradeQuestionLevelGroupMeanRate,
            name: '年级平均得分率'
        }
    ];

    var summaryInfo = getSummaryInfo(classQuestionLevelGroupMeanRate, gradeQuestionLevelGroupMeanRate);

    return (
        <div style={{marginRight: 20, display: 'inline-block'}}>
            <div style={{marginBottom: 18}}>
                <span className={commonClass['sub-title']}>试题难度题组表现</span>
                <span className={commonClass['title-desc']}>我们把这次考试的所有题目按照难度分成了5个题组</span>
            </div>
            <div style={{width: 560, height: 465, border: '1px solid' + colorsMap.C05, borderRadius: 2}}>
                {/**放置highcharts图 */}
            <ECharts option={option} style={{height:400}}></ECharts>
            <p style={{fontSize: 12, marginTop: 0,marginLeft:15,marginRight:15}}><span style={{color: colorsMap.B08}}>*</span>{summaryInfo}</p>
            </div>
        </div>
    )
}

function getSummaryInfo(classQuestionLevelGroupMeanRate, gradeQuestionLevelGroupMeanRate) {
    var temp = _.map(classQuestionLevelGroupMeanRate, (classMeanRate, i) => (_.round(_.subtract(classMeanRate, gradeQuestionLevelGroupMeanRate[i]), 2)));
    temp = _.map(_.reverse(questionLevelTitles), (qt, i) => {//因为计算难度分组的时候是最小的在最前面，最小=最难，所以最难在最前面，这里需要reverse一下
        return {
            name: qt,
            diff: temp[i]
        }
    });
    // debugger;
    temp = _.sortBy(temp, 'diff');
    var isAllGood = _.every(temp, (obj) => obj.diff >= 0);
    var isAllBad = _.every(temp, (obj) => obj.diff <= 0);
// debugger;
    if(isAllGood) {
        return `本次考试中，班级整体没有明显表现不好的题组，表现最好的题组是${_.last(temp).name}，请总结经验继续保持`;
    } else if(isAllBad) {
        return `本次考试中，班级整体在各个题组都表现不太理想，特别是在${_.first(temp).name}表现最为不好，请及时针对此类题组进行专项训练`;
    } else {
        return `本次考试中，班级整体在${_.last(temp).name}表现很好，但是在${_.first(temp).name}表现不好，请结合班级实际情况，关注重点，在下一次考试中，提高班级整体水平`;
    }
}


//=================================================  迁移分界线  =================================================
//算法：
//1.计算每一道题目的难度。
//2.按照难度高低排序，分类出5个难度等级
//3.计算班级和年级在这五种难度类型的题目上的平均得分率=（这一类型中所有题目的得分率之和/题目数量）

//问：怎么突出“与同等水平学生相比”？？？
function getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var allStudentsPaperQuestionInfo = {}, result = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var gradePaperStudents = allStudentsPaperMap[pid];
        var currentClassPaperStudents = _.filter(gradePaperStudents, (studentObj) => studentObj['class_name'] == currentClass);

        var gradeQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, gradePaperStudents, allStudentsPaperQuestionInfo);
        var classQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, currentClassPaperStudents, allStudentsPaperQuestionInfo);

        var gradeQuestionLevelGroup = getGradeQuestionLevelGroup(paperObj.questions, gradeQuestionScoreRates);//怎么分五组？某一类型题组上的得分率
        result[pid] = getQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, paperObj.questions);
    });
    return result;
}

function getQuestionScoreRate(questions, pid, students, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//TODO: 怎么分组？？？--（得分率最高-得分率最低）/ 5
function getGradeQuestionLevelGroup(questions, gradeQuestionScoreRates) {
    var temp = _.map(questions, (obj, index) => {
        return {
            name: obj.name,
            score: obj.score,
            gradeRate: gradeQuestionScoreRates[index],
            qid: obj.qid
        }
    });
    temp = _.sortBy(temp, 'gradeRate');

    var segments = getStepSegments(temp);
    // 0.3, 0.4, 0.5, 0.6, 0.7, 0.8
    var gradeQuestionLevelGroup = {};
    _.each(_.range(segments.length-1), (index) => {
        var targets = _.filter(temp, (obj) => (index == 0) ? (segments[index] <= obj.gradeRate && obj.gradeRate <= segments[index+1]) : (segments[index] < obj.gradeRate && obj.gradeRate <= segments[index+1]));
        gradeQuestionLevelGroup[index] = targets;
    });
    return gradeQuestionLevelGroup;
}

function getQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, questions) {
    var classQuestionLevelGroup = getClassQuestionLevelGroup(gradeQuestionLevelGroup, classQuestionScoreRates, questions);
    var classQuestionLevelGroupMeanRate = _.map(classQuestionLevelGroup, (questionRateMap) => _.round(_.mean(_.values(questionRateMap)), 2));
    var gradeQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup, (questionRateArr) => _.round(_.mean(_.map(questionRateArr, (obj) => obj.gradeRate)), 2));
    return {
        gradeQuestionLevelGroupMeanRate: gradeQuestionLevelGroupMeanRate,
        classQuestionLevelGroupMeanRate: classQuestionLevelGroupMeanRate
    }
}

function getClassQuestionLevelGroup(gradeQuestionLevelGroup, classQuestionScoreRates, questions) {
    var classQuestionLevelGroup = {};
    var classQuestionScoreRateMap = {};
    _.each(questions, (obj, index) => classQuestionScoreRateMap[obj.qid] = classQuestionScoreRates[index]);
    _.each(gradeQuestionLevelGroup, (objs, key) => {
        var qids = _.map(objs, (obj) => obj.qid);
        classQuestionLevelGroup[key] = _.pick(classQuestionScoreRateMap, qids);
    });
    return classQuestionLevelGroup;
}

function getStepSegments(gradeRateInfo) {
    var step = _.round(_.divide(_.subtract(_.last(gradeRateInfo).gradeRate, _.first(gradeRateInfo).gradeRate), 5), 2);
    var segments = [];
    segments.push(_.first(gradeRateInfo).gradeRate);
    _.each(_.range(4), (index) => {
        var nextRate = _.round(_.sum([segments[index], step]), 2);
        segments.push(nextRate);
    });
    segments.push(_.last(gradeRateInfo).gradeRate);
    return segments;
}
