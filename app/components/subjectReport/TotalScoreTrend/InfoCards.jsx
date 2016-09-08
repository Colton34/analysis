import _ from 'lodash';
import React from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function InfoCards ({currentPaperInfo, currentPaperStudentsInfo}) {
    var headerData = getHeaderData(currentPaperInfo, currentPaperStudentsInfo);
    debugger;
    return (
        <div style={{marginTop: 30}}>
            试卷共  {headerData.totalQuestionCount} 道题目，主观题  {headerData.subjectiveQuestionsCount} 道，分值占比 {headerData.subjectiveQuestionsScorePercentage}，客观题 {headerData.objectiveQuestionsCount} 道，分值占比 {headerData.objectiveQuestionsScorePercentage}；学科总分 {currentPaperInfo.fullMark}，本次考试年级最高分 {headerData.maxScore} 分，最低分 {headerData.minScore} 分，年级平均分 {headerData.avgScore} 分。
        </div>
    )
}


function getHeaderData(currentPaperInfo, currentPaperStudentsInfo) {
    var questionInfo = getQuestionInfo(currentPaperInfo);
    var avgScore = _.round(_.mean(_.map(currentPaperStudentsInfo, (obj) => obj.score)), 2);
    var maxScore = _.last(currentPaperStudentsInfo).score;
    var minScore = _.first(currentPaperStudentsInfo).score;
    return _.assign({}, questionInfo, {
        maxScore: maxScore,
        minScore: minScore,
        avgScore: avgScore
    });
}

function getQuestionInfo(currentPaperInfo) {
    var currentPaperQuestions = currentPaperInfo.questions;
    var totalQuestionCount = currentPaperQuestions.length;
    var objectiveQuestions = [], subjectiveQuestions = [];
    _.each(currentPaperQuestions, (questionObj) => {
        (questionObj.answer) ? objectiveQuestions.push(questionObj) : subjectiveQuestions.push(questionObj);
    });
    var subjectiveQuestionsCount = subjectiveQuestions.length;

    var subjectiveQuestionsScorePercentage = _.round(_.multiply(_.divide(_.sum(_.map(subjectiveQuestions, (questionObj) => questionObj.score)), currentPaperInfo.fullMark), 100) , 2);
    var objectiveQuestionsCount = objectiveQuestions.length;
    var objectiveQuestionsScorePercentage = _.round((100 - subjectiveQuestionsScorePercentage), 2);
    return {
        totalQuestionCount: totalQuestionCount,
        subjectiveQuestionsCount: subjectiveQuestionsCount,
        subjectiveQuestionsScorePercentage: subjectiveQuestionsScorePercentage + '%',
        objectiveQuestionsCount: objectiveQuestionsCount,
        objectiveQuestionsScorePercentage: objectiveQuestionsScorePercentage + '%'
    }
}
