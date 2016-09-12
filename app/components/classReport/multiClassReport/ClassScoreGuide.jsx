//班级成绩概况:暂时不清楚
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../common/EnhanceTable';
import TableView from '../../../common/TableView';

import commonClass from '../../../common/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

var COLUMN_NAMES = ['最高分', '最低分', '平均分', '考试人数'];
var INDICATORFUNS = [getMaxScore, getMinScore, getMeanScore, getRealStudentCount];
var columnIndicatorFunMap = getIndicatorFunMap(COLUMN_NAMES, INDICATORFUNS);

export default function ClassScoreGuide({reportDS}) {
    var examInfo = reportDS.examInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
    var gradeName = examInfo.gradeName;
    var examName = examInfo.name;
    var exportTableName = examName + '-' + gradeName + '-' +'班级成绩概况';
    var worksheetName = '班级成绩概况';
    allStudentsPaperMap['totalScore'] = reportDS.examStudentsInfo.toJS();
    var subjectNames = _.map(headers, (headerObj) => headerObj.subject);
    var classNames = _.keys(studentsGroupByClass);
    classNames.unshift('totalGrade');

    var tableHeaders = getTableHeaderDS(subjectNames);
    var tableBodyDS = getTableBodyDS(classNames, gradeName, examPapersInfo, allStudentsPaperMap, studentsGroupByClass, headers, columnIndicatorFunMap);

    return (
        <div id='classScoreGuide' className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>班级成绩概况</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <div style={{marginTop: 30}}>
            <TableView id='classScoreGuidTable' tableHeaders={tableHeaders} tableData={tableBodyDS} TableComponent={EnhanceTable} options={{canDownload: true, fileName: exportTableName, worksheetName: worksheetName}}/>
            </div>
        </div>
    )
}


//=================================================  分界线  =================================================
function getTableHeaderDS(subjectNames) {
    var tableHeaders = [[{id: 'class', name: '班级', rowSpan: 2}], []];
    _.each(subjectNames, (subject) => {
        var obj = {};
        obj.name = subject;
        obj.colSpan = 4;
        obj.headerStyle = {textAlign: 'center'};
        tableHeaders[0].push(obj);
        _.each(COLUMN_NAMES, (subHead, index) => {
            var obj = {};
            obj.id = subject + '_' + subHead;
            obj.name = subHead;
            if(subHead === '最高分' || subHead === '最低分' || subHead === '平均分') {
                obj.columnSortable = true;
                obj.columnStyle = getTableColumnStyle;
            }
            tableHeaders[1].push(obj);
        })
    });
    return tableHeaders;
}

function getTableBodyDS(classNames, gradeName, examPapersInfo, allStudentsPaperMap, studentsGroupByClass, headers, columnIndicatorFunMap) {
    return _.map(classNames, (className, index) => {
        var  obj = {};
        var classStudentsPaperMap = className !== 'totalGrade'?  getClassStudentsPaperMap(allStudentsPaperMap, className) : allStudentsPaperMap;
        var classStudents = className !== 'totalGrade' ?  studentsGroupByClass[className] : allStudentsPaperMap['totalScore'];

        obj.class = className !== 'totalGrade' ? (gradeName +  className + '班') : '全年级';
        _.each(headers, (headerObj) => {
            var paperScores = (headerObj.id == 'totalScore') ? _.map(classStudents, (stuObj) => stuObj.score) : _.map(classStudentsPaperMap[headerObj.id], (paper) => paper.score);
            _.each(columnIndicatorFunMap, (fun, key) => obj[headerObj.subject+'_'+key] = fun({paperScores: paperScores, examPapersInfo: examPapersInfo, studentsGroupByClass: studentsGroupByClass, headerObj: headerObj, currentClass: className, allStudentsPaperMap: allStudentsPaperMap}));
        });
        return obj;
    });
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

function getRealStudentCount({studentsGroupByClass, examPapersInfo, headerObj, currentClass, allStudentsPaperMap}) {
    return (headerObj.id == 'totalScore') ? (currentClass!=='totalGrade' ? studentsGroupByClass[currentClass].length : allStudentsPaperMap['totalScore'].length): (currentClass !== 'totalGrade' ? examPapersInfo[headerObj.id].classes[currentClass] : allStudentsPaperMap[headerObj.id].length);//实考人数
}

function getIndicatorFunMap(columnNames, indicatorFuns) {
    var result = {};
    _.each(columnNames, (coluName, index) => {
        result[coluName] = indicatorFuns[index];
    });
    return result;
}

function getClassStudentsPaperMap(allStudentsPaperMap, currentClass) {
    var result = {};
    _.each(allStudentsPaperMap, (students, pid) => {
        var classStudents = _.filter(students, (studentObj) => studentObj['class_name'] == currentClass);
        if(classStudents || classStudents.length > 0) result[pid] = classStudents;
    });
    return result;
}

// 各班级数据和年级数据做比较，小于全年级数据则标红
function getTableColumnStyle(cell, rowData, rowIndex, columnIndex, id, tableData) {
    if (cell < tableData[0][id]) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}