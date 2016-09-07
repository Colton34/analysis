import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';

class ClassSubjectQuestion extends React.Component {
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
        var {gradeQuestionSeparation, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, this.props.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.allClassesQuestionScoreRate = allClassesQuestionScoreRate;

        this.state = {
            currentClass: examClasses[0]
        }
    }

    componentWillReceiveProps(nextProps) {
        //建立新的科目的各个班级的info
        var currentPaperInfo = nextProps.reportDS.examPapersInfo.toJS()[nextProps.currentSubject.pid];
        var examClasses = currentPaperInfo.realClasses;
        var currentPaperQuestions = currentPaperInfo.questions, allStudentsPaperMap = nextProps.reportDS.allStudentsPaperMap.toJS(), examStudentsInfo = nextProps.reportDS.examStudentsInfo.toJS();
        var currentPaperStudentsInfo = allStudentsPaperMap[nextProps.currentSubject.pid];

        var {gradeQuestionSeparation, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, nextProps.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.allClassesQuestionScoreRate = allClassesQuestionScoreRate;
        this.state = {
            currentClass: examClasses[0]
        }
    }

    render() {
        var currentClassQuestionScoreRate = this.allClassesQuestionScoreRate[this.state.currentClass];
        var gradeQuestionSeparation = this.gradeQuestionSeparation;
        return (
            <div></div>
        );
    }
}
//校级的区分度都是一样的，不同的是班级
function getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, currentPaperId, allStudentsPaperMap, examStudentsInfo, allStudentsPaperQuestionInfo) {
    var studentsByClass = _.groupBy(currentPaperStudentsInfo, 'class_name');
    var gradeQuestionSeparation = getGradeQuestionSeparation(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo);

    var allClassesQuestionScoreRate = {};
    _.each(studentsByClass, (students, classKey) => {
        allClassesQuestionScoreRate[classKey] = getClassQuestionScoreRate(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo, classKey);
    });
    return {
        gradeQuestionSeparation: gradeQuestionSeparation,
        allClassesQuestionScoreRate: allClassesQuestionScoreRate
    };

    // var classQuestionScoreRates = getClassQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass);
    // var gradeQuestionScoreRates = getGradeQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
    // var questionContriFactors = _.map(classQuestionScoreRates, (x, i) => _.round(_.subtract(x, gradeQuestionScoreRates[i]), 2));

}

export default ClassSubjectQuestion;



function getClassQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var currentClassPaperStudents = _.filter(allStudentsPaperMap[pid], (studentObj) => studentObj['class_name'] == currentClass);
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(currentClassPaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
//计算本班级的此道题目的得分率：
    //本班所有学生 在此道题目上得到的平均分（所有得分和/人数） 除以  此道题的满分
    var gradePaperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        //本班学生在这道题上面的得分率：mean(本班所有学生在这道题上的得分) / 这道题目的总分
        return _.round(_.divide(_.mean(_.map(gradePaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

//firstInput: 某一道题目得分  secondInput: 此道题目所属科目的成绩
function getGradeQuestionSeparation(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var paperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
        var questionScores = _.map(paperStudents, (studentObj) => allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index]);
        var paperScores = _.map(paperStudents, (studentObj) => studentObj.score);
        return _.round(StatisticalLib.sampleCorrelation(questionScores, paperScores), 2);
    });
}
