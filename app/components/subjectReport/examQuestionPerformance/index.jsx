// 学科报告：试卷整体命题及考试表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';
import commonClass from '../../../common/common.css';
import DistributionTableModule from './distributionTableModule';
import GradeQuestionDiffModule from './gradeQuestionDiffModule';

//TODO:文案数据：本学科的整体难度。。。。本学科全部试题难度的平均值
export default function ExamQuestionPerfromance({currentSubject, reportDS}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var allStudentsPaperQuestionInfo = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });
    var currentPaperQuestions = reportDS.examPapersInfo.toJS()[currentSubject.pid].questions, allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
    var currentPaperStudentsInfo = allStudentsPaperMap[currentSubject.pid];
    var paperQuestionsDiffInfo = getPaperQuestionsDiffInfo(currentPaperQuestions, currentSubject.pid, currentPaperStudentsInfo, allStudentsPaperQuestionInfo);

    var gradeQuestionSeparation = getGradeQuestionSeparation(currentPaperQuestions, currentSubject.pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
    var summaryInfo = getSummaryInfo(paperQuestionsDiffInfo);
    return (
        <div id="examQuestionPerformance" className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>试卷整体命题及考试表现</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <DistributionTableModule paperQuestionsDiffInfo={paperQuestionsDiffInfo} />
            <GradeQuestionDiffModule gradeQuestionSeparation={gradeQuestionSeparation} paperQuestionsDiffInfo={paperQuestionsDiffInfo} />
        </div>
    )
}

/*
[
    {
        qid: ,
        name: ,
        score: ,
        answer: , -- 作为是否是客观题的判断标准
        diff:
    }
]
 */
function getPaperQuestionsDiffInfo(currentPaperQuestions, currentPaperId, currentPaperStudentsInfo, allStudentsPaperQuestionInfo) {
    var paperQuestionsDiff = getPaperQuestionsDiff(currentPaperQuestions, currentPaperId, currentPaperStudentsInfo, allStudentsPaperQuestionInfo);
    var temp;
    return _.map(currentPaperQuestions, (obj, i) => {
        temp = _.pick(obj, ['qid', 'name', 'score']);
        temp.isObjective = (obj.answer) ? true : false;
        temp.diff = paperQuestionsDiff[i];
        return temp;
    });
}


function getPaperQuestionsDiff(currentPaperQuestions, currentPaperId, currentPaperStudentsInfo, allStudentsPaperQuestionInfo) {
    return _.map(currentPaperQuestions, (questionObj, index) => {
        return _.round(_.divide(_.mean(_.map(currentPaperStudentsInfo, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][currentPaperId].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionSeparation(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var paperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        var questionScores = _.map(paperStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]);
        var paperScores = _.map(paperStudents, (studentObj) => studentObj.score);
        return _.round(StatisticalLib.sampleCorrelation(questionScores, paperScores), 2);
    });
}

function getSummaryInfo(paperQuestionsDiffInfo) {
    var paperDiff = _.round(_.divide(_.sum(_.map(paperQuestionsDiffInfo, (obj) => obj.diff)), paperQuestionsDiffInfo.length), 2);
    //TODO: 通过当前paperDiff的值给出结论。【偏难】。。等
    return '';
}