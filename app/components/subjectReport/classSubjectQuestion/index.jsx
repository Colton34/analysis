//班级学科试题表现的差异情况  K线图
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
        var {gradeQuestionSeparation, gradeQuestionScoreRates, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, this.props.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.gradeQuestionScoreRates = gradeQuestionScoreRates;
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

        var {gradeQuestionSeparation, gradeQuestionScoreRates, allClassesQuestionScoreRate} = getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, nextProps.currentSubject.pid, allStudentsPaperMap, examStudentsInfo, this.allStudentsPaperQuestionInfo);
        this.gradeQuestionSeparation = gradeQuestionSeparation;
        this.gradeQuestionScoreRates = gradeQuestionScoreRates;
        this.allClassesQuestionScoreRate = allClassesQuestionScoreRate;
        this.state = {
            currentClass: examClasses[0]
        }
    }

    render() {
        var gradeQuestionSeparation = this.gradeQuestionSeparation;
        var gradeQuestionScoreRates = this.gradeQuestionScoreRates;
        var currentClassQuestionScoreRate = this.allClassesQuestionScoreRate[this.state.currentClass];
        debugger;

        return (
            <div style={{color:'red',fontSize:18}}>填充K线图</div>

        );
    }
}
//校级的区分度都是一样的，不同的是班级
function getQuestionInfo(currentPaperQuestions, currentPaperStudentsInfo, currentPaperId, allStudentsPaperMap, examStudentsInfo, allStudentsPaperQuestionInfo) {
    var studentsByClass = _.groupBy(currentPaperStudentsInfo, 'class_name');
    var gradeQuestionSeparation = getGradeQuestionSeparation(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo);
    var gradeQuestionScoreRates = getGradeQuestionScoreRate(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo);

    var allClassesQuestionScoreRate = {};
    _.each(studentsByClass, (students, classKey) => {
        allClassesQuestionScoreRate[classKey] = getClassQuestionScoreRate(currentPaperQuestions, currentPaperId, allStudentsPaperMap, allStudentsPaperQuestionInfo, classKey);
    });
    return {
        gradeQuestionSeparation: gradeQuestionSeparation,
        gradeQuestionScoreRates: gradeQuestionScoreRates,
        allClassesQuestionScoreRate: allClassesQuestionScoreRate
    };
}

export default ClassSubjectQuestion;



function getClassQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass) {
    var currentClassPaperStudents = _.filter(allStudentsPaperMap[pid], (studentObj) => studentObj['class_name'] == currentClass);
    return _.map(questions, (questionObj, index) => {
        return _.round(_.divide(_.mean(_.map(currentClassPaperStudents, (studentObj) => {
            return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
        })), questionObj.score), 2);
    });
}

function getGradeQuestionScoreRate(questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo) {
    var gradePaperStudents = allStudentsPaperMap[pid];
    return _.map(questions, (questionObj, index) => {
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

//Test Code
// var classQuestionScoreRates = getClassQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo, currentClass);
// var gradeQuestionScoreRates = getGradeQuestionScoreRate(paperObj.questions, pid, allStudentsPaperMap, allStudentsPaperQuestionInfo);
// var questionContriFactors = _.map(classQuestionScoreRates, (x, i) => _.round(_.subtract(x, gradeQuestionScoreRates[i]), 2));
