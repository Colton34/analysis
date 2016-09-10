//班级学科试题表现的差异情况  K线图
import _ from 'lodash';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';
import ECharts from 'react-echarts';
import DropdownList from '../../../common/DropdownList';


class ClassSubjectQuestion extends React.Component {
    constructor(props) {
        super(props);
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        this.allStudentsPaperQuestionInfo = {};
        _.each(examStudentsInfo, (studentObj) => {
            this.allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
        });

        var currentPaperInfo = this.props.reportDS.examPapersInfo.toJS()[this.props.currentSubject.pid];
        this.examClasses = _.map(currentPaperInfo.realClasses, (classKey) => {
            return {
                key: classKey,
                value: classKey + '班'
            }
        });

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[this.props.currentSubject.pid];
        var {gradeQuestionSeparation, gradeQuestionScoreRates, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, this.props.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        var questionNames = getQuestionName(currentPaperQuestions);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.gradeQuestionScoreRates = gradeQuestionScoreRates;
        this.allClassesQuestionScoreRate = allClassesQuestionScoreRate;
        this.questionNames = questionNames;
        this.state = {
            currentClass: this.examClasses[0]
        }
    }

    componentWillReceiveProps(nextProps) {
        //建立新的科目的各个班级的info
        var currentPaperInfo = nextProps.reportDS.examPapersInfo.toJS()[nextProps.currentSubject.pid];
        this.examClasses = _.map(currentPaperInfo.realClasses, (classKey) => {
            return {
                key: classKey,
                value: classKey + '班'
            }
        });
        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = nextProps.reportDS.allStudentsPaperMap.toJS(), examStudentsInfo = nextProps.reportDS.examStudentsInfo.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[nextProps.currentSubject.pid];
        var questionNames = getQuestionName(currentPaperQuestions);
        var {gradeQuestionSeparation, gradeQuestionScoreRates, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, nextProps.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.gradeQuestionScoreRates = gradeQuestionScoreRates;
        this.allClassesQuestionScoreRate = allClassesQuestionScoreRate;
        this.questionNames = questionNames;
        this.state = {
            currentClass: this.examClasses[0]
        }
    }

    changeClass(item) {
        this.setState({
            currentClass: item
        })
    }

    render() {
        var gradeQuestionSeparation = this.gradeQuestionSeparation;
        var gradeQuestionScoreRates = this.gradeQuestionScoreRates;
        var currentClassQuestionScoreRate = this.allClassesQuestionScoreRate[this.state.currentClass.key];
        var questionNames = this.questionNames;
        var chartData = getChartDS(gradeQuestionSeparation,gradeQuestionScoreRates,currentClassQuestionScoreRate,questionNames);
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
                               return param.data.number+'<br/>'+'区分度：'+param.data.distinguish+'<br/>'+'得分率：'+param.data.value[0]+'<br/>'+'高于年级平均：'+(param.data.value[1]-param.data.value[0]).toFixed(2);
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
        option.xAxis.data = gradeQuestionSeparation.sort();
        option.series[0].data = chartData;
        var examClasses = this.examClasses;
        return (
            <div style={{position:'relative'}}>
                <div style={{marginBottom: 18,marginTop:30}}>
                    <span className={commonClass['sub-title']}>班级学科试题表现的差异情况</span>
                    <span className={commonClass['title-desc']}>对比各班级的学科各试题题目的得分率，可以看到，各班级有表现较好的试题，也有表现不好的试题。这一现象是值得教师认真分析的</span>
                </div>
                <ECharts option={option} style={{width:1340,height:400,position:'relative',left:-100,top:0}}></ECharts>
                <DropdownList list={examClasses} onClickDropdownList={this.changeClass.bind(this)} style={{position: 'absolute', top: 30, right: 50, zIndex: 1}} />
            </div>
        );
    }
}
//校级的区分度都是一样的，不同的是班级
function getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, currentPaperId, allStudentsPaperMap, examStudentsInfo, allStudentsPaperQuestionInfo) {
    var studentsByClass = _.groupBy(currentPaperStudentsInfo, 'class_name');
    var gradeQuestionSeparation = getGradeQuestionSeparation(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo);
    var gradeQuestionScoreRates = getGradeQuestionScoreRate(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo);

    var allClassesQuestionScoreRate = {};
    _.each(studentsByClass, (students, classKey) => {
        allClassesQuestionScoreRate[classKey] = getClassQuestionScoreRate(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo, classKey);
    });
    return {
        gradeQuestionSeparation: gradeQuestionSeparation,
        gradeQuestionScoreRates: gradeQuestionScoreRates,
        allClassesQuestionScoreRate: allClassesQuestionScoreRate
    };
}

export default ClassSubjectQuestion;



function getClassQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass) {
    var currentClassPaperStudents = _.filter(allStudentsPaperMap[pid], (studentObj) => studentObj['class_name'] == currentClass);
    return _.map(questions, (questionObj, index) => {
        return _.round(_.divide(_.mean(_.map(currentClassPaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var gradePaperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        return _.round(_.divide(_.mean(_.map(gradePaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//firstInput: 某一道题目得分  secondInput: 此道题目所属科目的成绩 TODO: 如果所有学生对于此道题目的得分都是零，由于计算方法的原因，导出NaN
function getGradeQuestionSeparation(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var paperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        var questionScores = _.map(paperStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]);
        var paperScores = _.map(paperStudents, (studentObj) => studentObj.score);
        return _.round(StatisticalLib.sampleCorrelation(questionScores, paperScores), 2);
    });
}

//Test Code
// var classQuestionScoreRates = getClassQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass);
// var gradeQuestionScoreRates = getGradeQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
// var questionContriFactors = _.map(classQuestionScoreRates, (x, i) => _.round(_.subtract(x, gradeQuestionScoreRates[i]), 2));
function getQuestionName(currentPaperQuestions){
    var questionNames = _.map(currentPaperQuestions,(obj) => {return obj.name});
    return questionNames;
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

function getChartDS(gradeQuestionSeparation,gradeQuestionScoreRates,currentClassQuestionScoreRate,questionNames){
    var chartDS = _.map(_.range(_.size(questionNames)),(index) => {
        return {
            value:[gradeQuestionScoreRates[index],currentClassQuestionScoreRate[index],gradeQuestionScoreRates[index],currentClassQuestionScoreRate[index]],
            number:questionNames[index],
            distinguish:gradeQuestionSeparation[index]
        }
    });
    return  _.sortBy(chartDS,'distinguish');
}
