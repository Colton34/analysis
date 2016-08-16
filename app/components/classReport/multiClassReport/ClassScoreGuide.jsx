//班级成绩概况:暂时不清楚
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../common/EnhanceTable';
import TableView from '../../../common/TableView';

import commonClass from '../../../common/common.css';

var COLUMN_NAMES = ['最高分', '最低分', '平均分', '考试人数'];
var INDICATORFUNS = [getMaxScore, getMinScore, getMeanScore, getRealStudentCount];
var columnIndicatorFunMap = getIndicatorFunMap(COLUMN_NAMES, INDICATORFUNS);

export default function ClassScoreGuide({reportDS}) {
    var gradeName = reportDS.examInfo.toJS().gradeName, examPapersInfo = reportDS.examPapersInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
    var subjectNames = _.map(headers, (headerObj) => headerObj.subject);
    var classNames = _.keys(studentsGroupByClass);

    var tableHeaders = getTableHeaderDS(subjectNames);
    var tableBodyDS = getTableBodyDS(classNames, examPapersInfo, allStudentsPaperMap, studentsGroupByClass, headers, columnIndicatorFunMap);

    debugger;


    return (
        <div id='classScoreGuide' className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>班级成绩概况</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <div style={{marginTop: 30}}>
            <TableView id='classScoreGuidTable' tableHeaders={tableHeaders} tableData={tableBodyDS} TableComponent={EnhanceTable} options={{canDownload: true}}/>
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
        tableHeaders[0].push(obj);
        _.each(COLUMN_NAMES, (subHead, index) => {
            var obj = {};
            obj.id = subject + '_' + subHead;
            obj.name = subHead;
            tableHeaders[1].push(obj);
        })
    });
    return tableHeaders;
    // return {tableHeaders: tableHeaders, tableSubHeads: tableSubHeads}
}

function getTableBodyDS(classNames, examPapersInfo, allStudentsPaperMap, studentsGroupByClass, headers, columnIndicatorFunMap) {
    return _.map(classNames, (className, index) => {
        var obj = {}, classStudentsPaperMap = getClassStudentsPaperMap(allStudentsPaperMap, className), classStudents = studentsGroupByClass[className];
        obj.class = className;
        _.each(headers, (headerObj) => {
            var paperScores = (headerObj.id == 'totalScore') ? _.map(classStudents, (stuObj) => stuObj.score) : _.map(classStudentsPaperMap[headerObj.id], (paper) => paper.score);
            _.each(columnIndicatorFunMap, (fun, key) => obj[headerObj.subject+'_'+key] = fun({paperScores: paperScores, examPapersInfo: examPapersInfo, studentsGroupByClass: studentsGroupByClass, headerObj: headerObj, currentClass: className}));
        });
        return obj;
    });
}

/*

    var value;
    return _.map(classHeaders, (headerObj, index) => {
        var obj = {};
        var paperScores = _.map(classStudentsPaperMap[headerObj.id], (paper) => paper.score);
        _.each(columnIndicatorFunMap, (fun, key) => {
            value = fun({paperScores: paperScores, examClassesInfo: examClassesInfo, currentClass: currentClass, examPapersInfo: examPapersInfo, headerObj: headerObj});
            obj[key] = (key == '缺考人数') ? {value: value, overlayData: {title: '学生名单', content: getLostStudentNames(examClassesInfo, classStudentsPaperMap, headerObj, currentClass, classStudents)}} : value;
        });
        return obj;
    });



var classes = ['初一1班', '初一2班', '初一3班', '初一4班', '初一5班'];
var tableData = [];
_.forEach(classes, (className, index) => {
    var obj = {};
    obj.class = className;
    _.forEach(subjects, subject=> {
        _.forEach(tableSubHeads, subHead => {
            obj[subject+'_'+subHead] = parseInt(Math.random() * 50);
        })
    })
    tableData.push(obj);
});

 */



function getMaxScore({paperScores}) {
    return _.max(paperScores);//最高分
}

function getMinScore({paperScores}) {
    return _.min(paperScores);//最低分
}

function getMeanScore({paperScores}) {
    return _.round(_.mean(paperScores), 2);//平均分
}

function getRealStudentCount({studentsGroupByClass, examPapersInfo, headerObj, currentClass}) {
    return (headerObj.id == 'totalScore') ? studentsGroupByClass[currentClass].length : examPapersInfo[headerObj.id].classes[currentClass];//实考人数
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
