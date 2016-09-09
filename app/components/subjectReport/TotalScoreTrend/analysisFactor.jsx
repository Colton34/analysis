import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import StatisticalLib from 'simple-statistics';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

var functionList = [getSubjectName, getRealStudentCount, getLostStudentCount, getFullMark, getMaxScore, getMinScore, getMeanScore, getStandardDeviation, getDiscriminationFactor, getDifficulty, getReliabilityCoefficient, getSampleCorrelation];

export default function AnalysisFactor({currentPaperInfo, currentPaperStudentsInfo, reportDS, currentSubject}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();

    var paperScores = _.map(currentPaperStudentsInfo, (obj) => obj.score);//Note:已经排好序了，从小到大
    var tableData = [['科目', '参考总人数', '缺考人数', '满分', '最高分', '最低分', '平均分', '标准差', '差异系数', '难度', 'α信度系数', '相关系数'], []];

    _.forEach(functionList, func => {
        tableData[1].push(func({currentPaperInfo, paperScores, currentPaperStudentsInfo, currentSubject, examStudentsInfo}));
    })

    return (
        <div>
            <div style={{marginBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>学科考试常用分析指标</span>
                <span className={commonClass['title-desc']}>观察本次考试的常用分析指标，结合年级及班级自身情况，发现本学科教学信息</span>
            </div>
            <TableView tableData={tableData}/>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析与诊断：</p>
                <div>作为学校组织的学科考试，总体难度控制为<span style={{color: colorsMap.B03}}>{tableData[1][9]}</span>。关于试题难度更详细的分析可参见本报告“实体整体命题”部分。</div>
            </div>
        </div>
    )
}


function getSubjectName({currentPaperInfo}) {
    return currentPaperInfo.subject;//学科
}
function getFullMark({currentPaperInfo}) {
    return currentPaperInfo.fullMark;//满分
}
function getMaxScore({paperScores}) {
    return _.max(paperScores);//最高分
}
function getMinScore({paperScores}) {
    return _.min(paperScores);//最低分
}
function getMeanScore({paperScores}) {
    return _.round(_.mean(paperScores), 2);//平均分
}
function getStandardDeviation({paperScores}) {
    return _.round(StatisticalLib.standardDeviation(paperScores), 2);//标准差
}
function getDiscriminationFactor({paperScores}) {
    var sdevia = _.round(StatisticalLib.standardDeviation(paperScores), 2);
    var mean = _.mean(paperScores);
    return _.round(_.divide(sdevia, mean), 2);//差异系数: 标准差/平均分
}
function getDifficulty({paperScores, currentPaperInfo}) {
    var mean = _.mean(paperScores);
    return _.round(_.divide(mean, currentPaperInfo.fullMark), 2);//难度
}
function getRealStudentCount({currentPaperInfo}) {
    return currentPaperInfo.realStudentsCount;//实考人数
}
function getLostStudentCount({currentPaperInfo}) {
    return currentPaperInfo.lostStudentsCount;//缺考人数
}
//a=[K/(K-1)]×[1-(∑S2i)/(S2x)] -- k是此科目题目数量； ∑S2i是每道题目的方差和  S2x是所有题目总分（即学科得分）的方差
function getReliabilityCoefficient({currentPaperStudentsInfo, currentSubject, examStudentsInfo}) {
//当前科目所包含的题目 每个学生在各个题目上的得分
    var currentSubjectStudentQuestionScores = getStudentsQuestionScores(examStudentsInfo, currentSubject);
    var k = currentSubjectStudentQuestionScores[0].length;
    var tempMap = {};
    _.each(_.range(k), (i) => tempMap[i] = []);
    _.each(currentSubjectStudentQuestionScores, (stuQueScores) => {
        _.each(stuQueScores, (score, i) => tempMap[i].push(score));
    });
    var questionVarianceSum = _.sum(_.map(tempMap, (queScoArr) => StatisticalLib.variance(queScoArr)));
    var paperScoreVariance = StatisticalLib.variance(_.map(currentPaperStudentsInfo, (obj) => obj.score));
    var reliabilityCoefficient = _.round(_.multiply(_.divide(k, (k-1)), (1 - _.divide(questionVarianceSum, paperScoreVariance))), 2);
    return reliabilityCoefficient;
}

function getStudentsQuestionScores(examStudentsInfo, currentSubject) {
    // var allStudentsPaperQuestionInfo = {};
    //各个学生在当前学科的小分表
    var currentSubjectStudentQuestionScores = [], targetQuestionScoreObj;
    _.each(examStudentsInfo, (studentObj) => {
        var targetQuestionScoreObj = _.find(studentObj.questionScores, (obj) => obj.paperid == currentSubject.pid);
        if(targetQuestionScoreObj) currentSubjectStudentQuestionScores.push(targetQuestionScoreObj['scores']);
    });
    return currentSubjectStudentQuestionScores;
}

function getSampleCorrelation({currentPaperStudentsInfo, examStudentsInfo}) {
//注意要是当前考了此科目的学生的信息
    var currentPaperStudentScoreMap = {};
    _.each(currentPaperStudentsInfo, (obj) => currentPaperStudentScoreMap[obj.id] = obj.score);
    var allStudentScoreMap = {};
    _.each(examStudentsInfo, (obj) => allStudentScoreMap[obj.id] = obj.score);
    var currentPaperStudentIds = _.keys(currentPaperStudentScoreMap);
    var currentPaperStudentTotalScoreMap = _.pick(allStudentScoreMap, currentPaperStudentIds);
    return _.round(StatisticalLib.sampleCorrelation(_.values(currentPaperStudentTotalScoreMap), _.values(currentPaperStudentScoreMap)), 2);
}
