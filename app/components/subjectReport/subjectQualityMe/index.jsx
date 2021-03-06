// 学科报告：学科教学质量分析
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import StudentSubjectDistribution from './StudentSubjectDistribution';
import ClassSubjectLevel from './ClassSubjectLevel';
import StudentsGroupLevel from './StudentsGroupLevel';
import ClassSubjectQuestion from '../classSubjectQuestion';
import ClassDiffQuestionModule from '../classDiffQuestion';

import {makeFactor} from '../../../sdk';

import {COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function SubjectQualityModule({currentSubject, reportDS}) {
    var examStudentsInfo = reportDS.examStudentsInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), totalScoreFullMark = reportDS.examInfo.toJS().fullMark;
    var paperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid], paperFullMark = reportDS.examPapersInfo.toJS()[currentSubject.pid].fullMark;
    var classList = _.keys(studentsGroupByClass);
    var subjectMeans = getCurrentSubjectMean(paperStudentsInfo, classList);
    var contriFactors = getContriFactors(examStudentsInfo, studentsGroupByClass, totalScoreFullMark, paperStudentsInfo, paperFullMark, classList);
    var contriFactorsTableData = getContriFactorsTableData(subjectMeans, contriFactors, classList);
    var contriFactorsSummary = getContriFactorsSummary(contriFactors, classList);
    return (
        <div id='subjectQuality' className={commonClass['section']}>
            <div style={{marginBottom: 30}}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科教学质量分析</span>
                <div className={commonClass['title-desc']} style={{marginTop: 5}}>各班级某学科的表现，是所有考试科目表现的其中之一，它们之间存在一定的关联性，不仅要分析班级平均分的高低，要联系班级及全校多学科的综合水平来考察，班级某一个学科的相对表现水平。这可用学科得分率贡献指数来表达。如下表各班级本科表现：</div>
            </div>
            <TableView tableData={contriFactorsTableData} colorCallback={tableColorCallback}/>

            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <div>
                    对于各班自身学科综合水平而言，经分析得出各个班级本学科的得分率贡献指数，表达该班级本学科对班级学科综合水平的贡献情况。数值为正，越大越好；数值为负，绝对值越大越不好。
                    根据上面的数表，
                    {
                        contriFactorsSummary.length ? <span><span style={{color: colorsMap.B03}}>{_.join(contriFactorsSummary.map(classInfo => {return classInfo.className + '班' }), '、') }</span>的<span style={{margin: '0 5px'}}>{currentSubject.subject}</span>教学值得注意。</span>
                        : <span>{currentSubject.subject} 是在本次考试中表现很强的优势学科。</span>
                    }
                </div>
            </div>

            <StudentSubjectDistribution reportDS={reportDS} currentSubject={currentSubject}/>
            <ClassSubjectLevel reportDS={reportDS} currentSubject={currentSubject}/>
            <StudentsGroupLevel reportDS={reportDS} currentSubject={currentSubject}/>
            <ClassSubjectQuestion currentSubject={currentSubject} reportDS={reportDS} />
            <ClassDiffQuestionModule currentSubject={currentSubject} reportDS={reportDS} />
        </div>
    )
}

function getContriFactors(examStudentsInfo, studentsGroupByClass, totalScoreFullMark, paperStudentsInfo, paperFullMark, classList) {
    var totalScoreMeanRate = getTotalScoreMeanRate(examStudentsInfo, studentsGroupByClass, totalScoreFullMark);
    var currentSubjectMeanRate = getCurrentSubjectMeanRate(paperStudentsInfo, paperFullMark, classList);
    var originalMatrix = [];
    originalMatrix.push(totalScoreMeanRate);
    originalMatrix.push(currentSubjectMeanRate);
    return makeFactor(originalMatrix)[0];
}

function getCurrentSubjectMean(paperStudentsInfo, classList) {
    var totalSchoolSubjectMean = _.round(_.mean(_.map(paperStudentsInfo, (obj) => obj.score)), 2);
    var groupPaperStudentsInfoByClass = _.groupBy(paperStudentsInfo, 'class_name');
    var classSubjectMeans = _.map(classList, className => {
        if(groupPaperStudentsInfoByClass[className]) {
            return _.round(_.mean(_.map(groupPaperStudentsInfoByClass[className], (student) => {return student.score}), 2));
        } else {
            return 0;
        }
    })
    // 以下方法没有考虑到某些班级没有参加该科目考试的情况:
    // var classSubjectMeans = _.map(_.groupBy(paperStudentsInfo, 'class_name'), (students, classKey) => {
    //     return _.round(_.mean(_.map(students, (obj) => obj.score)), 2);
    // });
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

function getCurrentSubjectMeanRate(paperStudentsInfo, paperFullMark, classList) {
    var totalSchoolRate = _.round(_.divide(_.mean(_.map(paperStudentsInfo, (obj) => obj.score)), paperFullMark), 2);
    var paperStudentsInfoByClass = _.groupBy(paperStudentsInfo, 'class_name');

    var classRates = _.map(classList, className => {
        if (paperStudentsInfoByClass[className]) {
            return _.round(_.divide(_.mean(_.map(paperStudentsInfoByClass[className], (obj) => obj.score)), paperFullMark), 2); 
        } else {
            return 0;
        }
    })
    // 以下方法没有考虑到某些班级没有参加该科目考试的情况
    // var classRates = _.map(_.groupBy(paperStudentsInfo, 'class_name'), (students, classKey) => {
    //     return _.round(_.divide(_.mean(_.map(students, (obj) => obj.score)), paperFullMark), 2);
    // });
    classRates.unshift(totalSchoolRate);
    return classRates;
    
}

function getContriFactorsTableData(subjectMeans, contriFactors, classList) {
    var tableData = [];
    var tableHead = ['学科', '年级'];
    _.forEach(classList, className => {
        tableHead.push(className + '班');
    })
    tableData.push(tableHead);

    var subjectMeansRowData = ['学科平均分'];
    subjectMeansRowData =  subjectMeansRowData.concat(subjectMeans);
    tableData.push(subjectMeansRowData);

    var contriFactorsRowData = ['学科得分率贡献指数', 0];
    contriFactorsRowData =  contriFactorsRowData.concat(contriFactors);
    tableData.push(contriFactorsRowData);

    return tableData;
}

function getContriFactorsSummary(contriFactors, classList) {
    var classFactorsList = [];
    _.forEach(classList, (className, index) => {
        var obj = {};
        obj.className = className;
        obj.factor = contriFactors[index];
        classFactorsList.push(obj);
    })
    return _.takeWhile(_.sortBy(classFactorsList, 'factor'), item => {return item.factor < 0});
}


function tableColorCallback(data) {
    if (data < 0) return colorsMap.B08;
    else return 'inherit';
}
