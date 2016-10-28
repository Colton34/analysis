//学科考试内在表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import ECharts from 'react-echarts';

class QuestionPerformance extends React.Component {
    constructor(props) {
        super(props);
        var currentLesson = this.props.currentLesson;
        this.zoubanLessonStudentsInfo = this.props.zoubanLessonStudentsInfo;
        this.classes = _.keys(this.zoubanLessonStudentsInfo[currentLesson.key]);
        this.state={
            currentClass:this.classes[0]
        }
    }
    componentWillReceiveProps(nextProps){
        var {currentLesson,zoubanLessonStudentsInfo} = nextProps;
        this.classes = _.keys(zoubanLessonStudentsInfo[currentLesson.key]);
        this.state={
            currentClass:this.classes[0]
        }
    }
    changeClass(newClass){
        this.setState({
            currentClass:newClass
        });
        console.log(newClass);
    }
    render(){
        var currentClass = this.state.currentClass;
    return (
        <div className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>学科试题考试内在表现</span>
            <span className={commonClass['title-desc']}></span>
            <PaperClassSelector  classes={this.classes} currentClass={this.state.currentClass} changeClass={this.changeClass.bind(this)}/>
            <SummaryCard  currentClass={currentClass} currentLesson={this.props.currentLesson} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zoubanExamInfo={this.props.zoubanExamInfo} zuobanLessonQuestionInfo={this.props.zuobanLessonQuestionInfo}/>
            <SummaryText currentClass={currentClass}/>
            <PerformanceChart currentClass={currentClass} currentLesson={this.props.currentLesson} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zoubanExamInfo={this.props.zoubanExamInfo} zuobanLessonQuestionInfo={this.props.zuobanLessonQuestionInfo} />
            <QuestionMeanRateChart currentClass={currentClass} currentLesson={this.props.currentLesson} zoubanLessonStudentsInfo={this.zoubanLessonStudentsInfo} zoubanExamInfo={this.props.zoubanExamInfo} zuobanLessonQuestionInfo={this.props.zuobanLessonQuestionInfo}/>
        </div>
    )
    }
}
export default QuestionPerformance;
function SummaryCard({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}) {
    var {goodQuestion,badQuestion} = getCardSummary(zuobanLessonQuestionInfo,currentClass,currentLesson,zoubanExamInfo);
    return (
        <div style={{marginTop:30}}>
            <Card title={goodQuestion.join('   ')} titleStyle={{color: colorsMap.B04,fontSize:'24px'}} desc={'表现较好的题目'} style={{marginRight:20}}></Card>
            <Card title={badQuestion.join('   ')} titleStyle={{color: colorsMap.B08,fontSize:'24px'}} desc={'表现不足的题目'} ></Card>
        </div>
    )
}

function SummaryText({currentClass}) {
    return (
        <div style={{marginTop:30}}>
          <span>下图是本次考试，{currentClass}学科所有试题区分度/难度的表现分布情况，其中通过柱形图重点展示出表现较好和表现不足的部分试题。</span>
          <ul style={{paddingLeft:15}}>
            <li style={{paddingLeft:0,marginTop:'5px',fontSize:'14px',color:'#6a6a6a'}}>绿色柱形图表示题目表现较好，该题目本班的得分率高于全年级的平均得分率。图形高度表示高于的大小.</li>
            <li style={{paddingLeft:0,fontSize:'14px',color:'#6a6a6a'}}>红色柱形图表示题目表现不足，该题目本班的得分率低于全年级的平均得分率。图形高度表示低于的大小.</li>
          </ul>
        </div>
    )
}

function PerformanceChart({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}) {
    var chartData = getChartData(zuobanLessonQuestionInfo,currentClass,currentLesson,zoubanExamInfo);
    chartData = _.filter(chartData, (obj) => _.isNumber(obj.distinguish) && !_.isNaN(obj.distinguish));
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
    option.xAxis.data = _.map(chartData, (obj) => obj.distinguish);
    option.series[0].data = chartData;
    return (
        <div >
            <ECharts option={option} style={{width:1340,height:400,position:'relative',left:-100,top:0}}></ECharts>
        </div>
    )
}

function QuestionMeanRateChart({currentClass,currentLesson,zoubanLessonStudentsInfo,zoubanExamInfo,zuobanLessonQuestionInfo}) {
    var gradeQuestionScoreRates = getQuestionScoreRates(zuobanLessonQuestionInfo,currentClass,currentLesson);
    var questions = getQuestions (currentLesson,zuobanLessonQuestionInfo,zoubanExamInfo);
    var gradeQuestionLevelGroup = getGradeQuestionLevelGroup(questions, gradeQuestionScoreRates);
    var classQuestionLevelGroupMeanRate = getClassQuestionLevelGroupMeanRate(gradeQuestionLevelGroup,currentClass);
    var lessonQuestionLevelGroupMeanRate = getLessonQuestionLevelGroupMeanRate(gradeQuestionLevelGroup);
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
            data: ['班级平均得分率', '年级平均得分率'],
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
            color:['#0099ff','#B1B1B1']
        }]
    };
    option.series[0].data = [
        {
            value: _.reverse(classQuestionLevelGroupMeanRate),
            name: '班级平均得分率'
        },
        {
            value: _.reverse(lessonQuestionLevelGroupMeanRate),
            name: '年级平均得分率'
        }
    ];
    return (
        <div>
            <span className={commonClass['sub-title']}>试题难度表现的差异情况</span>
            <div style={{width: 1140, height: 400, border: '1px solid' + colorsMap.C05, borderRadius: 2,marginBottom:20,marginTop:30}}>
                <div style={{width:600,height:400,margin:'0 auto'}}>
                    <ECharts option={option} ></ECharts>
                </div>
            </div>
        </div>
    )
}

const Card = ({title, desc, style, titleStyle}) => {
    return (
         <span style={_.assign({}, localStyle.card, style ? style : {})}>
            <div style={{display: 'table-cell',width: 560,  height: 112, verticalAlign: 'middle', textAlign: 'center'}}>
                <p style={_.assign({lineHeight: '40px', fontSize: 32, marginTop: 15, width: 560}, localStyle.lengthControl, titleStyle ? titleStyle : {})}
                    title={title}
                    >
                    {title}
                </p>
                <p style={{fontSize: 12}}>{desc}</p>
            </div>
        </span>
    )
}
class PaperClassSelector extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var classes = this.props.classes;
        var currentClass = this.props.currentClass;
        return (
            <div style={{heigth: 50, lineHeight: '50px',marginTop:0,padding:' 0px'}} className={commonClass['section']}>
                <span style={{ float: 'left', marginRight: 10}}>教学班:</span>
                <span style={{float: 'left', width: 1000}}>
                    {
                        classes.map((className, index) => {
                            return (
                                <span key={'classNames-' + index} style={{display: 'inline-block', marginRight: 30, minWidth: 50}} >
                                    <input value={className} onClick={this.props.changeClass.bind(this,className)} style={{ marginRight: 5, cursor: 'pointer' }} type='radio' name={'class'} checked={className===currentClass}/>
                                    <span>{className}</span>
                                </span>
                            )
                        })
                    }
                </span>
                <div style={{clear: 'both'}}></div>
            </div>
        );
    }
}
var localStyle = {
    card: {
        display: 'inline-block', width: 560, height: 112, lineHeight: '112px', border: '1px solid ' + colorsMap.C05, background: colorsMap.C02
    },
    lengthControl: {
        overflow: 'hidden', whiteSpace: 'pre', textOverflow: 'ellipsis'
    }
}

function getCardSummary(zuobanLessonQuestionInfo,currentClass,currentLesson,zoubanExamInfo){
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
    var questionsPerformArry = _.map(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var performance = _.subtract(question[currentClass].mean, question.lesson.mean);
        return {
            name:currentLessonQuestions[index].name,
            performance:performance
        }
    });
    var goodQuestion =_.map(_.takeRight(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    var badQuestion = _.map(_.take(_.sortBy(questionsPerformArry,'performance'),5),function(question){
        return question.name;
    });
    return {goodQuestion,badQuestion};
}
function getChartData(zuobanLessonQuestionInfo,currentClass,currentLesson,zoubanExamInfo){
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
    var chartData =_.sortBy( _.map(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var lessonRate = question.lesson.rate;
        var classRate = question[currentClass].rate;
        return {
            distinguish:question.lesson.separations,
            number:currentLessonQuestions[index].name,
            value:[lessonRate,classRate,lessonRate,classRate]
        }
    }),'distinguish');
    return chartData;
}
function getQuestionScoreRates(zuobanLessonQuestionInfo,currentClass,currentLesson){
    var questions = zuobanLessonQuestionInfo[currentLesson.key];
    var gradeQuestionScoreRates = _.map(questions,function(question){
        return question.lesson.rate;
    });

    return gradeQuestionScoreRates;
}

function getGradeQuestionLevelGroup(questions, gradeQuestionScoreRates) {

    var temp = _.map(questions, (obj, index) => {
        return {
            name: obj.name,
            score: obj.score,
            gradeRate: gradeQuestionScoreRates[index],
            qid: obj.qid,
            scoreInfo:obj.scoreInfo
        }
    });
    temp = _.sortBy(temp, 'gradeRate');
    var segments = getStepSegments(temp);
    var gradeQuestionLevelGroup = {};
    _.each(_.range(segments.length-1), (index) => {
        var targets = _.filter(temp, (obj) => (index == 0) ? (segments[index] <= obj.gradeRate && obj.gradeRate <= segments[index+1]) : (segments[index] < obj.gradeRate && obj.gradeRate <= segments[index+1]));
        gradeQuestionLevelGroup[index] = targets;
    });

    return gradeQuestionLevelGroup;
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
function getQuestions (currentLesson,zuobanLessonQuestionInfo,zoubanExamInfo){
    var currentLessonQuestions = (_.find(zoubanExamInfo.lessons,function(lesson){
        return lesson.objectId===currentLesson.key;
    })).questions;
     var questionsInfo = _.map(zuobanLessonQuestionInfo[currentLesson.key],function(question,index){
        var scoreInfo = question;
        return{
            name:currentLessonQuestions[index].name,
            score:currentLessonQuestions[index].score,
            qid:currentLessonQuestions[index].qid,
            scoreInfo:scoreInfo
        }
    })

    return questionsInfo;
}
function getClassQuestionLevelGroupMeanRate(gradeQuestionLevelGroup,currentClass){

     var classQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup,function(questionGroup){
        var temp = _.round(_.mean(_.map(questionGroup,function(question){
            return question.scoreInfo[currentClass].rate;
        })),2);
        return temp;
    });

    return classQuestionLevelGroupMeanRate;
}
function getLessonQuestionLevelGroupMeanRate(gradeQuestionLevelGroup){

     var lessonQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup,function(questionGroup){
        var temp = _.round(_.mean(_.map(questionGroup,function(question){
            return question.scoreInfo.lesson.rate;
        })),2);
        return temp;
    });

    return lessonQuestionLevelGroupMeanRate;
}
