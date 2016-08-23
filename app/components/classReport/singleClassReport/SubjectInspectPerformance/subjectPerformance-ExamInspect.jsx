//学科考试内在表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ECharts from 'react-echarts';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
//style
import commonClass from '../../../../common/common.css';
var option = {
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
    textStyle:{
             color:'#000'
           },
    tooltip: {
                   formatter: function (param) {
                       return param.data.number+'<br/>'+'区分度'+param.data.distinguish+'<br/>'+'年级平均得分率'+param.data.value[0]+'<br/>'+'班级平均得分率'+param.data.value[1];
                   }
               },
    series: [
        {
            type: 'candlestick',
            itemStyle: {
                normal: {
                //  width:10,
                    color: 'rgb(105, 193, 112)',
                    color0: 'rgb(238, 107, 82)',
                    borderColor: 'rgb(105, 193, 112)',
                    borderColor0: 'rgb(238, 107, 82)'
                }
            }
        }
    ]
};

export default function ExamInspectPerformance({best, worst}) {
    var {categoryData, values} = getChartDS(best, worst);
    option.xAxis.data = categoryData;
    option.series[0].data = values;
    return (
        <div >
            <ECharts option={option} style={{width:1340,height:400,position:'relative',left:-100,top:0}}></ECharts>
        </div>
    )
}

/*

{
    name: obj.name,
    gradeRate: gradeQuestionScoreRates[i],
    classRate: classQuestionScoreRates[i],
    factor: questionContriFactors[i],
    separation: questionSeparation[i]
}

var values = [
    {
        value: [<年级平均得分率，班级平均得分率， 重复年级，重复班级>],
        number: '',
        distinguish:
    },
    ...
]


 */

function getChartDS(best, worst) {
    var temp = _.sortBy(_.concat(best, worst), 'separation');
    var categoryData = _.map(temp, (obj) => obj.separation);
    var values = _.map(temp, (obj) => {
        return {
            value: [obj.gradeRate, obj.classRate, obj.gradeRate, obj.classRate],
            number: obj.name,
            distinguish: obj.separation
        }
    });
    return {
        categoryData: categoryData,
        values: values
    }
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
