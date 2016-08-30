//学科小分得分率对比
import _ from 'lodash';
import React, { PropTypes } from 'react';

import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';

import DropdownList from '../../../common/DropdownList';

class SubjectSmallScore extends React.Component {
    constructor(props) {
      super(props);
        var examPapersInfo = this.props.reportDS.examPapersInfo.toJS(), examStudentsInfo = this.props.reportDS.examStudentsInfo.toJS(), examClassesInfo = this.props.reportDS.examClassesInfo.toJS(), studentsGroupByClass = this.props.reportDS.studentsGroupByClass.toJS(), allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS(), gradeName = this.props.reportDS.examInfo.toJS().gradeName, headers = this.props.reportDS.headers.toJS();
        this.formatedSubjects = getFormatedSubjects(headers);
        var theDS = getDS(examPapersInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, gradeName);
        this.theDS = theDS;
        this.state = {
            currentSubject: this.formatedSubjects[0]
        }
    }

    changeSubject(item) {
        this.setState({
            currentSubject: item
        })
    }

    render() {
        var {tableHeaders, tableBodyData} = getFormatedData(this.theDS[this.state.currentSubject.key]);
        var formatedSubjects = this.formatedSubjects;
        return (
            <div id='subjectSmallScore' className={commonClass['section']} style={{position:'relative'}}>
                <div style={{marginBottom: 30}}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>学科实体得分率对比</span>
                    <span className={commonClass['title-desc']}></span>
                </div>
                <DropdownList onClickDropdownList={this.changeSubject.bind(this)} list={formatedSubjects} style={{position: 'absolute', right: 110, top: 30, zIndex: 1}}/>
                <TableView id='smallScoreTable' tableData={tableBodyData} tableHeaders={tableHeaders} TableComponent={EnhanceTable} options={{canDownload:true}}/>
            </div>
        );
    }
}

export default SubjectSmallScore;
//=================================================  分界线  =================================================
function getFormatedData(theDS) {
    var tableHeaders = getFormatedTableHeaders(theDS[0]);
    var tableBodyData = getFormatedBodyData(tableHeaders[0], _.slice(theDS, 1));
    return {
        tableHeaders: tableHeaders,
        tableBodyData: tableBodyData
    }
}

function getFormatedTableHeaders(headerDS) {
    return [_.map(headerDS, (v, i) => {
        if(i == 0) return {id: 'tihao', name: '题目'};
        if(i == 1) return {id: 'avg', name: '年级平均得分率'};
        return {id: v, name: v}
    })]
}

function getFormatedBodyData(headerData, bodyDS) {
    return _.map(bodyDS, (rowData) => {
        var obj = {};
        _.each(headerData, (d, i) => {
            obj[d.id] = rowData[i]
        });
        return obj;
    })
}

//TODO: 设计--主客观题都走 分数 好了，而不再分客观题走数目--结果是一样的
function getDS(examPapersInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, allStudentsPaperMap, gradeName) {
    var allStudentsPaperQuestionInfo = {}, result = {}, tableDS, rowData;
    _.each(examStudentsInfo, (studentObj) => {
        allStudentsPaperQuestionInfo[studentObj.id] = _.keyBy(studentObj.questionScores, 'paperid');
    });

    //计算每个科目对应的数据
    _.each(examPapersInfo, (paperObj, pid) => {
        tableDS = [];
        _.each(paperObj.questions, (questionObj, index) => {
            rowData = [];
            var gradeScoreRate = getOneQuestionScoreRate(questionObj, allStudentsPaperMap[paperObj.id], allStudentsPaperQuestionInfo, pid, index);
            rowData.push(gradeScoreRate);
            var classesScoreRate = getClassesQuestionScoreRate(questionObj, allStudentsPaperMap[paperObj.id], allStudentsPaperQuestionInfo, pid, index, examClassesInfo);
            rowData = _.concat(rowData, classesScoreRate);
            rowData.unshift(questionObj.name);
            tableDS.push(rowData);
        });
        tableDS.unshift(getTableHeader(allStudentsPaperMap[paperObj.id], examClassesInfo, gradeName));
        result[pid] = tableDS;
    });
    return result;
}

function getTableHeader(allPaperStudents, examClassesInfo, gradeName) {
    var result = [];
    var classPaperStudentsMap = _.groupBy(allPaperStudents, 'class_name');
    _.each(examClassesInfo, (classObj, className) => {
        var classPaperStudents = classPaperStudentsMap[className];
        if(classPaperStudents && classPaperStudents.length > 0) result.push(gradeName+className+'班');
    });
    result = _.concat(['题目', '年级平均得分率'], result);
    return result;
}

function getOneQuestionScoreRate(questionObj, students, allStudentsPaperQuestionInfo, pid, index) {
    return _.round(_.divide(_.mean(_.map(students, (studentObj) => {
        return allStudentsPaperQuestionInfo[studentObj.id][pid].scores[index];
    })), questionObj.score), 2);
}

function getClassesQuestionScoreRate(questionObj, allPaperStudents, allStudentsPaperQuestionInfo, pid, index, examClassesInfo) {
    var classPaperStudentsMap = _.groupBy(allPaperStudents, 'class_name');
    var result = [];
    _.each(examClassesInfo, (classObj, className) => {
        var classPaperStudents = classPaperStudentsMap[className];
        if(!classPaperStudents || classPaperStudents.length == 0) return;
        result.push(getOneQuestionScoreRate(questionObj, classPaperStudents, allStudentsPaperQuestionInfo, pid, index));
    });
    return result;
}

function getFormatedSubjects(headers) {
    return _.map(_.slice(headers, 1), (headerObj) => {
        return {value: headerObj.subject, totalScore: headerObj.fullMark, fullMark: headerObj.fullMark, key: headerObj.id} //TODO:这个命名有问题，需要改！
    })
}
