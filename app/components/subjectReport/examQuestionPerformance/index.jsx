import _ from 'lodash';
import React, { PropTypes } from 'react';

//TODO:文案数据：本学科的整体难度。。。。本学科全部试题难度的平均值
export default function ExamQuestionPerfromance({currentSubject, reportDS}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();
    var allStudentsPaperQuestionInfo = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });
    var currentPaperQuestions = reportDS.examPapersInfo.toJS()[currentSubject.pid].questions;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var paperQuestionsDiffInfo = getPaperQuestionsDiffInfo(currentPaperQuestions, currentSubject.pid, currentPaperStudentsInfo, allStudentsPaperQuestionInfo);
    debugger;
    return (
        <div>

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




function getPaperDiff() {

}
