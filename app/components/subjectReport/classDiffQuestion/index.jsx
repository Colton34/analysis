import _ from 'lodash';
import React, { PropTypes } from 'react';

import {makeFactor} from '../../../sdk';

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

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, allClassLevelGroupFactorsInfo} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperInfo.fullMark, this.props.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        // this.allClassPaperMeanRate = allClassPaperMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;
        this.allClassLevelGroupFactorsInfo = allClassLevelGroupFactorsInfo;
        this.subjectName = currentPaperInfo.subject;

        this.state = {
            currentClass: examClasses[0]
        }
    }

    componentWillReceiveProps(nextProps) {
        var currentPaperInfo = nextProps.reportDS.examPapersInfo.toJS()[nextProps.currentSubject.pid];
        var examClasses = currentPaperInfo.realClasses;

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = nextProps.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[nextProps.currentSubject.pid];

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, allClassLevelGroupFactorsInfo} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperInfo.fullMark, nextProps.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        // this.allClassPaperMeanRate = allClassPaperMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;
        this.allClassLevelGroupFactorsInfo = allClassLevelGroupFactorsInfo;
        this.subjectName = currentPaperInfo.subject;

        this.state = {
            currentClass: examClasses[0]
        }
    }


    render() {
        var gradeQuestionLevelGroupMeanRate = this.gradeQuestionLevelGroupMeanRate;
        var currentClassLevelGroupMeanRate = this.allClassLevelGroupMeanRate[this.state.currentClass];
        var summaryInfo = getSummaryInfo(this.allClassLevelGroupFactorsInfo[this.state.currentClass], this.subjectName);
        debugger;

        // var summaryInfo = getSummaryInfo(currentClassPaperMeanRate, currentClassLevelGroupMeanRate);
/*
    option.series[0].data = [
        {
            value: _.reverse(classQuestionLevelGroupMeanRate),
            name: '班级平均得分率'
        },
        {
            value: _.reverse(gradeQuestionLevelGroupMeanRate),
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

            <ECharts option={option} style={{height:400}}></ECharts>
            <p style={{fontSize: 12, marginTop: 0,marginLeft:15,marginRight:15}}><span style={{color: colorsMap.B08}}>*</span>{summaryInfo}</p>
            </div>
        </div>
    )


 */


        return (
            <div>待填充</div>
        );
    }
}

export default ClassDiffQuestionModule;

function getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperFullMark, currentPaperId, allStudentsPaperQuestionInfo) {
    var studentsByClass = _.groupBy(currentPaperStudentsInfo, 'class_name');
    var allClassLevelGroupMeanRate = {};

    var gradeQuestionScoreRates = getQuestionScoreRate(currentPaperQuestions, currentPaperId, currentPaperStudentsInfo, allStudentsPaperQuestionInfo);
    var gradeQuestionLevelGroup = getGradeQuestionLevelGroup(currentPaperQuestions, gradeQuestionScoreRates);
    var gradeQuestionLevelGroupMeanRate = _.map(gradeQuestionLevelGroup, (questionRateArr) => _.round(_.mean(_.map(questionRateArr, (obj) => obj.gradeRate)), 2));

    _.each(studentsByClass, (subjectClassStudents, classKey) => {
        var classQuestionScoreRates = getQuestionScoreRate(currentPaperQuestions, currentPaperId, subjectClassStudents, allStudentsPaperQuestionInfo);
        allClassLevelGroupMeanRate[classKey] = getClassQuestionLevelGroupMeanRate(gradeQuestionLevelGroup, classQuestionScoreRates, currentPaperQuestions);
    });

    var allClassLevelGroupFactorsInfo = getClassQuestionLevelFactorsInfo(gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, currentPaperStudentsInfo, currentPaperFullMark, _.keys(studentsByClass));
    return {
        gradeQuestionLevelGroupMeanRate: gradeQuestionLevelGroupMeanRate,
        allClassLevelGroupMeanRate: allClassLevelGroupMeanRate,
        allClassLevelGroupFactorsInfo: allClassLevelGroupFactorsInfo
    }
}

function getClassQuestionLevelFactorsInfo(gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, currentPaperStudentsInfo, currentPaperFullMark, classKeys) {
    var questionGroupLastIndex = questionLevelTitles.length - 1;
    var {gradePaperMeanRate, allClassPaperMeanRate} = getPaperMeanRateInfo(currentPaperStudentsInfo, currentPaperFullMark);
    //组织originalMatrix，计算factors
    var theOriginalMatrix = getOriginalMatrix(gradePaperMeanRate, gradeQuestionLevelGroupMeanRate, allClassPaperMeanRate, allClassLevelGroupMeanRate);
    debugger; //确认这里每一行的数值都是从小到大的--难题在前面
    var theFactors = makeFactor(theOriginalMatrix);
    return _.zipObject(classKeys, theFactors);
    // var result = {};
    // _.each(theFactors, (classQuestionLevelFactors, index) => {

    // })
    //组织matrix
    //计算factors
    //作为数据结构，以classKey存储，并带上题组信息，供切换班级的时候得出分析结论
}

function getOriginalMatrix(gradePaperMeanRate, gradeQuestionLevelGroupMeanRate, allClassPaperMeanRate, allClassLevelGroupMeanRate) {
    var matrix = [], gradeRow = [], classRow;
    gradeRow.push(gradePaperMeanRate);
    gradeRow = _.concat(gradeRow, gradeQuestionLevelGroupMeanRate);
    matrix.push(gradeRow);
    _.each(allClassPaperMeanRate, (currentClassPaperMeanRate, classKey) => {
        classRow = [];
        classRow.push(currentClassPaperMeanRate);
        classRow = _.concat(classRow, allClassLevelGroupMeanRate[classKey]);
        matrix.push(classRow);
    });
    return matrix;
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
    temp = _.sortBy(temp, 'gradeRate');//得分率 == 正向 难度  得分率高==容易  这里是从小到大正序，所以是“最难”开始

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

//获取各个班级当前学科的平均得分率：
//  遍历各个班级
//      求得学科平均分，算出得分率
function getPaperMeanRateInfo(currentPaperStudentsInfo, currentPaperFullMark) {
    var gradePaperMeanRate = _.round(_.divide(_.mean(_.map(currentPaperStudentsInfo, (obj) => obj.score)), currentPaperFullMark), 2);
    var classesPaperMeanRate = {};
    _.each(_.groupBy(currentPaperStudentsInfo, 'class_name'), (students, classKey) => {
        var meanRate = _.round(_.divide(_.mean(_.map(students, (obj) => obj.score)), currentPaperFullMark), 2);
        classesPaperMeanRate[classKey] = meanRate;
    });
    return {
        gradePaperMeanRate: gradePaperMeanRate,
        allClassPaperMeanRate: classesPaperMeanRate
    };
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

function getSummaryInfo(currentClassLevelGroupFactorInfo, subjectName) {
    var infoHeader = `通过对数据的深入分析，对于${subjectName}学科五个不同难度题组，`;
    var lastQuestionTitleIndex = questionLevelTitles.length - 1;
    currentClassLevelGroupFactorInfo = _.map(currentClassLevelGroupFactorInfo, (factor, index) => {
        return {
            factor: factor,
            questionTitle: questionLevelTitles[lastQuestionTitleIndex - index]
        }
    });
    currentClassLevelGroupFactorInfo = _.orderBy(currentClassLevelGroupFactorInfo, ['factor'], ['desc']);
    var goodInfo = _.join(_.map(_.filter(currentClassLevelGroupFactorInfo, (obj) => obj.factor > 0), (fobj) => fobj.questionTitle), '，');
    var normalInfo = _.join(_.map(_.filter(currentClassLevelGroupFactorInfo, (obj) => obj.factor == 0), (fobj) => fobj.questionTitle), '，');
    var badInfo = _.join(_.map(_.filter(currentClassLevelGroupFactorInfo, (obj) => obj.factor < 0), (fobj) => fobj.questionTitle), '，');

    var infoBody;
    if(goodInfo && normalInfo && badInfo) {
        //三者都有
        infoBody = `本班在${goodInfo}表现较好，在${normalInfo}表现一般，在${badInfo}表现较差`;
    } else if(goodInfo && normalInfo && !badInfo) {
        //好的，一般的，没有坏的
        infoBody = `本班在${goodInfo}表现较好，在${normalInfo}表现一般。`;
    } else if(goodInfo && !normalInfo && badInfo) {
        //好的，坏的，没有一般的
        infoBody = `本班在${goodInfo}表现较好，在${badInfo}表现较差`;
    } else if(!goodInfo && normalInfo && badInfo) {
        //一般的，坏的，没有好的
        infoBody = `本班在${normalInfo}表现一般，在${badInfo}表现较差`;
    } else if(goodInfo && !normalInfo && !badInfo) {
        //只有好的
        infoBody = `本班在所有上都表现较好，可以及时总结经验，继续保持`;
    } else if(!goodInfo && normalInfo && !badInfo) {
        //只有一般的
        infoBody = '本班在所有上都表现一般，可以通过细致检查，提升拔高'
    } else if(!goodInfo && !normalInfo && badInfo) {
        //只有坏的
        infoBody = '本班在所有上都表现较差，希望能及时总结原因，加强查漏补缺';
    }
    return infoHeader + infoBody;
}
