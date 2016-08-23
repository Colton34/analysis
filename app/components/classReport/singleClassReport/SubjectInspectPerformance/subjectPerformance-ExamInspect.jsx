//学科考试内在表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';
import ECharts from 'react-echarts';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
//style
import commonClass from '../../../../common/common.css';

class ExamInspectPerformance extends React.Component {
    constructor(props) {
        super(props);
        //构建数据结构
        var {reportDS, currentClass} = this.props;
        var examPapersInfo = reportDS.examPapersInfo.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
        var theDS = getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
    }
    render() {
        //随着state的当前变量进行展示
        var categoryData = [0.1,0.2,0.4,0.6,0.8,0.8,0.9];
        var values = [
             [ 0.1,0.2,0.1,0.2],
             [ 0.2,0.3, 0.2,0.3],
             [0.1,0.5, 0.1,0.5],
             [ 0.5,0.3,0.5,0.3],
             [ 0.7,0.8,0.7,0.8],
             [ 0.5,0.3,0.5,0.3],
             [ 0.7,0.8,0.7,0.8],
         ];

        var option = {
          //color:['#61a0a8', '#d48265'],
            title: {
                text: '',
            },
            xAxis: {
              name:'(区分度)',
              nameLocation:'end',
              nameTextStyle:{
                color:'#767676',
                fontSize:12
              },
              type: 'category',
              data: categoryData,
                axisLine: {//轴线
                  lineStyle:{
                    color:'#c0d0e0',
                  }
                },
                axisTick:{//刻度
                  show:false,
                },
                splitLine: {//分割线
                  show: true,
                  lineStyle:{
                    color:'#f2f2f2',
                    type:'dashed'
                  }
                },
            },
            yAxis: {
                // scale: false,//刻度是否从零开始
                name:'(得分率)',
                nameLocation:'end',
                nameTextStyle:{
                  color:'#767676',
                  fontSize:12
                },
                axisLine: {//轴线
                  lineStyle:{
                    color:'#c0d0e0',
                  }
                },
                axisTick:{//刻度
                  show:false,
                },
                splitLine: {//分割线
                  show: true,
                  lineStyle:{
                    color:'#f2f2f2',
                    type:'dashed'
                  }
                },
            },
                series: [
                {
                    type: 'candlestick',
                    data: values,
                    itemStyle: {
                        normal: {
                        //  width:10,
                            color: 'rgb(105, 193, 112)',
                            color0: 'rgb(238, 107, 82)',
                            borderColor: 'rgb(105, 193, 112)',
                            borderColor0: 'rgb(238, 107, 82)'
                }
            }
                }]
};
            return (
              <div >
                <ECharts option={option} style={{width:1340,height:400,position:'relative',left:-100,top:0}}></ECharts>
                </div>
            )
    }
}
export default ExamInspectPerformance;
//=================================================  分界线  =================================================
//Note: 题目贡献指数 = 班级此道题目平均得分率 - 全校此道题目平均得分率。指数值为正，是促进作用；为负，是拖后腿。
function getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var result = {}, currentClassStudents = studentsGroupByClass[currentClass];
    var allStudentsPaperQuestionInfo = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });
    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var classQuestionScoreRates = getClassQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass);
        var gradeQuestionScoreRates = getGradeQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
        var questionContriFactors = _.map(classQuestionScoreRates, (x, i) => _.round(_.subtract(x, gradeQuestionScoreRates[i]), 2));
        var gradeQuestionSeparation = getGradeQuestionSeparation(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
        result[pid] = {
            questionContriFactors: questionContriFactors,
            questionSeparation: gradeQuestionSeparation
        };
    });
    return result;
}

//Warning:所有有关学科的计算都应该是先找到“真正考试了此学科的所有考生”，然后再筛选出“此班级的学生”
function getClassQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var currentClassPaperStudents = _.filter(allStudentsPaperMap[pid], (studentObj) => studentObj['class_name'] == currentClass);
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(currentClassPaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var gradePaperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(gradePaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//firstInput: 某一道题目得分  secondInput: 此道题目所属科目的成绩
function getGradeQuestionSeparation(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var paperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        var questionScores = _.map(paperStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]);
        var paperScores = _.map(paperStudents, (studentObj) => studentObj.score);
        return StatisticalLib.sampleCorrelation(questionScores, paperScores).toFixed(2);
    });
}






//Discriminant coefficient 鉴别系数
//算法：
    //1.拿到全校学生 按照总分 的排序 数据（从低到高）--- 问：是按照总分排序还是单科成绩排序，影响到下面的计算结果
    //2.选出高分27%，和低分27%的学生
    //3.遍历每一道题目。
        //计算全校此道题目的鉴别系数（和区分度稍有不同）：客观题--PH=(总的高分27%中答对此道题目的人数)/27%总人数 PL= (总的低分27%中答对此道题目的人数)/27%总人数 区分度D=PH - Pl
                    //主观题--D = (XH-XL)/N*(H-L) 其中，XH是高分的27%对于此道题目的总得分，XL是低分的27%对此道题目的总得分，N是所有高分段+低分段学生的总人数，H是该题的最高分（这个最高分值限制在27%中--因为这个27%是根据总分排出来的，总分高
                    //不代表这一道题目是最高的--还是面向全部学生），L是该题的最低分（同样也是该怎么选择的问题）
//暂时不做统计使用。
// var targetCount = _.round(_.multiply(examStudentsInfo.length, 0.27));
// var betterStudents = _.takeRight(examStudentsInfo, targetCount), worseStudents = _.take(examStudentsInfo, targetCount);
// function getGradeQuestionDiscriminant(questions, pid, allStudentsPaperMap, targetCount, betterStudents, worseStudents, allStudentsPaperQuestionInfo) {
//     return _.map(questions, (questionObj, index) => {
//         var spearation;
//         //TODO: 计算的方式是否正确？
//         if(questionObj['[xb_answer_pic]']) {//Note:通过question中是否有[xb_answer_pic]来确定是主观题还是客观题
//             //主观题
//             var XH = _.sum(_.map(betterStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]));
//             var XL = _.sum(_.map(worseStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]));
//             //或者H和L针对的是此班级里面的：把“classStudentsPaperArr”代替下面sortBy中的的“allStudentsPaperMap[pid]”
//             // var classStudentsPaperArr = _.filter(allStudentsPaperMap[pid], (obj) => obj['class_name'] == currentClass);
//             var orderStudentPaperInfo = _.sortBy(allStudentsPaperMap[pid], 'score');
//             var H = _.last(orderStudentPaperInfo).score, L = _.first(orderStudentPaperInfo).score;
//             spearation = _.round((_.divide(_.subtract(XH, XL), _.multiply(_.multiply(targetCount, 2), _.subtract(H, L)))), 2);
//         } else {
//             //客观题
//             var PH = _.round(_.divide(_.sum(_.map(betterStudents, (studentObj) => {
//                 return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
//             })), _.multiply(targetCount, questionObj.score)), 2);
//             var PL = _.round(_.divide(_.sum(_.map(worseStudents, (studentObj) => {
//                 return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
//             })), _.multiply(targetCount, questionObj.score)), 2);
//             spearation = _.round(_.divide(PH, PL), 2);
//         }
//         return spearation;
//     });
// }
