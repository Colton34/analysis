//班级难度题组表现的差异情况
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ECharts from 'react-echarts';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';

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

class ClassDiffQuestionModule extends React.Component {
    constructor(props) {
        super(props);
        var examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS();
        this.allStudentsPaperQuestionInfo = {};
        _.each(examStudentsInfo, (studentObj) => {
            this.allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
        });

        var currentPaperInfo = this.props.reportDS.examPapersInfo.toJS()[this.props.currentSubject.pid];
        var examClasses = currentPaperInfo.realClasses;

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[this.props.currentSubject.pid];

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, this.props.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;

        this.state = {
            currentClass: examClasses[0]
        }
    }

    componentWillReceiveProps(nextProps) {
        var currentPaperInfo = nextProps.reportDS.examPapersInfo.toJS()[nextProps.currentSubject.pid];
        var examClasses = currentPaperInfo.realClasses;

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = nextProps.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[nextProps.currentSubject.pid];

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, nextProps.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;

        this.state = {
            currentClass: examClasses[0]
        }
    }

    render() {
        var currentClassLevelGroupMeanRate = this.allClassLevelGroupMeanRate[this.state.currentClass];
        var gradeQuestionLevelGroupMeanRate = this.gradeQuestionLevelGroupMeanRate;
        debugger;

        option.series[0].data = [
            {
                value: _.reverse(currentClassLevelGroupMeanRate),
                name: '班级平均得分率'
            },
            {
                value: _.reverse(gradeQuestionLevelGroupMeanRate),
                name: '年级平均得分率'
            }
        ];

    return (
        <div >
            <div style={{marginBottom: 18}}>
                <span className={commonClass['sub-title']}>班级难度题组表现的差异情况</span>
                <span className={commonClass['title-desc']}>应用大数据分析方法对具有相近难度的试题进行聚类，将题目分成5个难度的试题组。</span>
            </div>
            <div style={{width: 1140, height: 400, border: '1px solid' + colorsMap.C05, borderRadius: 2,marginBottom:20}}>
                <div style={{width:600,height:400,margin:'0 auto'}}>
                    <ECharts option={option} ></ECharts>
                </div>
            </div>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <div>
                    不同教学班级对相对较难题组的测试反应有不同的具体表现。比如处于本学科高端水平的是 8 班，在这类题组上 7 班， 6 班表现好，而处于本本学科低端水平的是 9 班，在这类题组上表现不错。
                </div>
            </div>
        </div>
    )


    }
}

export default ClassDiffQuestionModule;



function getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperId, allStudentsPaperQuestionInfo) {
    var studentsByClass = _.groupBy(currentPaperStudentsInfo, 'class_name');
    var allClassLevelGroupMeanRate = {};

    var gradeQuestionScoreRates = getQuestionScoreRate(currentPaperQuestions, currentPaperId, currentPaperStudentsInfo, allStudentsPaperQuestionInfo);
    var gradeQuestionLevelGroup = getGradeQuestionLevelGroup(currentPaperQuestions, gradeQuestionScoreRates);
    var gradeQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup, (questionRateArr) => _.round(_.mean(_.map(questionRateArr, (obj) => obj.gradeRate)), 2));

    _.each(studentsByClass, (subjectClassStudents, classKey) => {
        var classQuestionScoreRates = getQuestionScoreRate(currentPaperQuestions, currentPaperId, subjectClassStudents, allStudentsPaperQuestionInfo);
        allClassLevelGroupMeanRate[classKey] = getClassQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, currentPaperQuestions);
    });

    return {
        gradeQuestionLevelGroupMeanRate: gradeQuestionLevelGroupMeanRate,
        allClassLevelGroupMeanRate: allClassLevelGroupMeanRate
    }
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

//怎么分组？？？--（得分率最高-得分率最低）/ 5
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

function getClassQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, questions) {
    var classQuestionLevelGroup = getClassQuestionLevelGroup(gradeQuestionLevelGroup, classQuestionScoreRates, questions);
    var classQuestionLevelGroupMeanRate = _.map(classQuestionLevelGroup, (questionRateMap) => _.round(_.mean(_.values(questionRateMap)), 2));
    return classQuestionLevelGroupMeanRate;
}

//注意：gradeQuestionLevelGroup是倒序的，最难在最前面
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

function getSummaryInfo(classQuestionLevelGroupMeanRate, gradeQuestionLevelGroupMeanRate) {
    var temp = _.map(classQuestionLevelGroupMeanRate, (classMeanRate, i) => (_.round(_.subtract(classMeanRate, gradeQuestionLevelGroupMeanRate[i]), 2)));
    temp = _.map(questionLevelTitles, (qt, i) => {
        return {
            name: qt,
            diff: temp[i]
        }
    });
    temp = _.sortBy(temp, 'diff');
    var isAllGood = _.every(temp, (obj) => obj.diff >= 0);
    var isAllBad = _.every(temp, (obj) => obj.diff <= 0);
    if(isAllGood) {
        return `本次考试中，班级整体没有明显表现不好的题组，表现最好的题组是${_.last(temp).name}，请总结经验继续保持`;
    } else if(isAllBad) {
        return `本次考试中，班级整体在各个题组都表现不太理想，特别是在${_.first(temp).name}表现最为不好，请及时针对此类题组进行专项训练`;
    } else {
        return `本次考试中，班级整体在${_.last(temp).name}表现很好，但是在${_.first(temp).name}表现不好，请结合班级实际情况，关注重点，在下一次考试中，提高班级整体水平`;
    }
}
