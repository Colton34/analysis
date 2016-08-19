//试题难度题组表现

import React, { PropTypes } from 'react';

export default function QuestionLevel({reportDS, currentClass}) {

}


//=================================================  分界线  =================================================
//算法：
//1.计算每一道题目的难度。
//2.按照难度高低排序，分类出5个难度等级
//3.计算班级和年级在这五种难度类型的题目上的平均得分率=（这一类型中所有题目的得分率之和/题目数量）

//问：怎么突出“与同等水平学生相比”？？？
function getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var allStudentsPaperQuestionInfo = {}, result = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var gradePaperStudents = allStudentsPaperMap[pid];
        var currentClassPaperStudents = _.filter(gradePaperStudents, (studentObj) => studentObj['class_name'] == currentClass);

        var gradeQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, gradePaperStudents, allStudentsPaperQuestionInfo);
        var questionLevelGroup = getQuestionLevelGroup(paperObj.questions, gradeQuestionScoreRates);//怎么分五组？某一类型题组上的得分率

        var classQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, currentClassPaperStudents, allStudentsPaperQuestionInfo);

        result[pid] = {
            classQuestionScoreRates: classQuestionScoreRates,
            gradeQuestionScoreRates: gradeQuestionScoreRates
        };
    });
    return result;
}

function getQuestionScoreRate(questions, pid, students, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
            // debugger;
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//TODO: 怎么分组？？？--（得分率最高-得分率最低）/ 5
function getQuestionLevelGroup(gradeQuestionScoreRates, questions) {

}
