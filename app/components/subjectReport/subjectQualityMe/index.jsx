import _ from 'lodash';
import React, { PropTypes } from 'react';

import {makeFactor} from '../../../sdk';

export default function SubjectQualityModule({currentSubject, reportDS}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), totalScoreFullMark = reportDS.examInfo.toJS().fullMark;
    var paperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid], paperFullMark = reportDS.examPapersInfo.toJS()[currentSubject.pid].fullMark;
    var subjectMeans = getCurrentSubjectMean(paperStudentsInfo);
    var contriFactors = getContriFactors(examStudentsInfo, studentsGroupByClass, totalScoreFullMark, paperStudentsInfo, paperFullMark);
    debugger;
}

function getContriFactors(examStudentsInfo, studentsGroupByClass, totalScoreFullMark, paperStudentsInfo, paperFullMark) {
    var totalScoreMeanRate = getTotalScoreMeanRate(examStudentsInfo, studentsGroupByClass, totalScoreFullMark);
    debugger;
    var currentSubjectMeanRate = getCurrentSubjectMeanRate(paperStudentsInfo, paperFullMark);
    debugger;
    var originalMatrix = [];
    originalMatrix.push(totalScoreMeanRate);
    originalMatrix.push(currentSubjectMeanRate);
    return makeFactor(originalMatrix)[0];
}

function getCurrentSubjectMean(paperStudentsInfo) {
    var totalSchoolSubjectMean = _.round(_.mean(_.map(paperStudentsInfo, (obj) => obj.score)), 2);
    var classSubjectMeans = _.map(_.groupBy(paperStudentsInfo, 'class_name'), (students, classKey) => {
        return _.round(_.mean(_.map(students, (obj) => obj.score)), 2);
    });
    classSubjectMeans.unshift(totalSchoolSubjectMean);
    return classSubjectMeans;
}

//总分得分率；当前学科得分率
function getTotalScoreMeanRate(examStudentsInfo, studentsGroupByClass, totalScoreFullMark) {
    var totalSchoolRate = _.round(_.divide(_.mean(_.map(examStudentsInfo, (obj) => obj.score)), totalScoreFullMark), 2);
    var classRates = _.map(studentsGroupByClass, (students, classKey) => {
        return _.round(_.divide(_.mean(_.map(students, (obj) => obj.score)), totalScoreFullMark), 2);
    });
    classRates.unshift(totalSchoolRate);
    return classRates;
}

function getCurrentSubjectMeanRate(paperStudentsInfo, paperFullMark) {
    var totalSchoolRate = _.round(_.divide(_.mean(_.map(paperStudentsInfo, (obj) => obj.score)), paperFullMark), 2);
    var classRates = _.map(_.groupBy(paperStudentsInfo, 'class_name'), (students, classKey) => {
        return _.round(_.divide(_.mean(_.map(students, (obj) => obj.score)), paperFullMark), 2);
    });
    classRates.unshift(totalSchoolRate);
    return classRates;
}

