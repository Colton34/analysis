//班级难度题组表现的差异情况
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ECharts from 'react-echarts';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import commonClass from '../../../common/common.css';
import subjectReportStyle from '../../../styles/subjectReport.css';
import DropdownList from '../../../common/DropdownList';

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
        this.examClasses = _.map(currentPaperInfo.realClasses, (classKey) => {
            return {
                key: classKey,
                value: classKey + '班'
            }
        });

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[this.props.currentSubject.pid];

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, allClassLevelGroupFactorsInfo} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperInfo.fullMark, this.props.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;
        this.allClassLevelGroupFactorsInfo = allClassLevelGroupFactorsInfo;
        this.subjectName = currentPaperInfo.subject;

        this.state = {
            currentClass: this.examClasses[0]
        }
    }

    componentWillReceiveProps(nextProps) {
        var currentPaperInfo = nextProps.reportDS.examPapersInfo.toJS()[nextProps.currentSubject.pid];
        this.examClasses = _.map(currentPaperInfo.realClasses, (classKey) => {
            return {
                key: classKey,
                value: classKey + '班'
            }
        });

        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = nextProps.reportDS.allStudentsPaperMap.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[nextProps.currentSubject.pid];

        var {gradeQuestionLevelGroupMeanRate, allClassLevelGroupMeanRate, allClassLevelGroupFactorsInfo} = getQuestionInfo(currentPaperStudentsInfo, currentPaperQuestions, currentPaperInfo.fullMark, nextProps.currentSubject.pid, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionLevelGroupMeanRate = gradeQuestionLevelGroupMeanRate;
        this.allClassLevelGroupMeanRate = allClassLevelGroupMeanRate;
        this.allClassLevelGroupFactorsInfo = allClassLevelGroupFactorsInfo;
        this.subjectName = currentPaperInfo.subject;

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
        var gradeQuestionLevelGroupMeanRate = this.gradeQuestionLevelGroupMeanRate;
        var currentClassLevelGroupMeanRate = this.allClassLevelGroupMeanRate[this.state.currentClass.key];
        var summaryInfo = getSummaryInfo(this.allClassLevelGroupFactorsInfo[this.state.currentClass.key], this.subjectName);
        var examClasses = this.examClasses;

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
            <div  style={{position:'relative'}}>
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
                        {summaryInfo}
                    </div>
                </div>
                <DropdownList list={examClasses} onClickDropdownList={this.changeClass.bind(this)} style={{position: 'absolute', top: 70, right: 50, zIndex: 1}} />
            </div>
        )
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
    var theOriginalMatrix = getOriginalMatrix(gradePaperMeanRate, gradeQuestionLevelGroupMeanRate, allClassPaperMeanRate, allClassLevelGroupMeanRate);
    var theFactors = makeFactor(theOriginalMatrix);
    return _.zipObject(classKeys, theFactors);
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
    return _.map(questions, (questionObj, index) => {
        return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

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
