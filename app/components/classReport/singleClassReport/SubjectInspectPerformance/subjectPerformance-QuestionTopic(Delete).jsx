//试题对比图
import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function QuestionTopic({reportDS, currentClass}) {

}


//=================================================  分界线  =================================================
// export default function QuestionTopic({reportDS, currentClass}) {
//     var examStudentsInfo = reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
//     var theDS = getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass);
//     debugger;
// }

//计算每一道题目下：本班级和年级的得分率
function getDS(examPapersInfo, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, currentClass) {
    var allStudentsPaperQuestionInfo = {}, result = {};
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        var gradePaperStudents = allStudentsPaperMap[pid];
        var currentClassPaperStudents = _.filter(gradePaperStudents, (studentObj) => studentObj['class_name'] == currentClass);
        var classQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, currentClassPaperStudents, allStudentsPaperQuestionInfo);
        var gradeQuestionScoreRates = getQuestionScoreRate(paperObj.questions, pid, gradePaperStudents, allStudentsPaperQuestionInfo);
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
