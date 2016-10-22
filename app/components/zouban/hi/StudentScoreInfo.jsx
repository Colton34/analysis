import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import commonClass from '../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';

//这里需要通过radio来切换表格
export default class StudentScoreInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEquivalent: false
        }
    }

    render() {

        if(_.size(this.props.currentStudent) == 0) return (<h3>请先选择学生</h3>);
        var tableRowKeys = getTableRowKeys();
        var orderedColumnKeys = getOrderColumnKeys(this.props.lessonsByStudent);
        var tableInfo = getTableInfo(this.props.lessonsByStudent, this.props.zoubanExamStudentsInfo, this.props.zoubanLessonStudentsInfo, this.props.currentStudent, this.state.isEquivalent);
        var tableHeader = getTableHeader(this.props.lessonsByStudent);
        var tableBody = getTableData(tableRowKeys, orderedColumnKeys, tableInfo);
        tableBody.unshift(tableHeader);
        return (
            <div className={commonClass['section']}>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>考试基本成绩分数</span>
                <span className={commonClass['title-desc']}></span>
                <div style={{width:'1140px',padding:'10px 0',display:'table-cell',textAlign:'center'}}><span>{this.props.currentStudent.label}同学</span></div>
                <div style={{marginBottom:20}}>
                <TableView hover  tableData={tableBody}></TableView>
                </div>
                <span style={{color:'#333'}}>说明：比如全校某年级100人，处于年级20%得分的含义是处于第20名的同学，表格中显示该同学的总分及各科分数，方便学生和不同等级的同学进行对比。</span>

            </div>
        );
    }
}

// function getZoubanLessonStudentsInfoByStudent(zoubanExamStudentsInfo, zoubanLessonStudentsInfo, currentStudent) {
//     var targetStudent = _.find(zoubanExamStudentsInfo, (obj) => obj.id == currentStudent.value);
//     return _.
// }

function getTableRowKeys() {
    return [
        {id: 'score', value: '本人成绩'}, {id: 'rank', value: '年级排名'}, {id: 'over', value: '超过年级'}, {id: 'mean', value: '年级平均分'}, {id: 'top', value: '年级最高分'}, {id: 'over20%', value: '处于年级20%得分'},
        {id: 'over40%', value: '处于年级40%得分'}, {id: 'over60%', value: '处于年级60%得分'}, {id: 'over80%', value: '处于年级80%得分'}
    ]
}

function getOrderColumnKeys(lessonsByStudent) {
    return _.concat(['totalScore'], _.map(lessonsByStudent, (obj) => obj.objectId));
}

function getTableInfo(lessonsByStudent, zoubanExamStudentsInfo, zoubanLessonStudentsInfo, currentStudent, isEquivalent) {
    var result = {}, currentLessonStudents;
    var scoreKey = (isEquivalent) ? 'equivalentScore' : 'score';
    var totalInfo = getInfoItem(zoubanExamStudentsInfo, currentStudent, scoreKey, getRankKey(isEquivalent, true));
    result['totalScore'] = totalInfo;
    _.each(lessonsByStudent, (lessonObj) => {
        currentLessonStudents = _.unionBy(..._.values(zoubanLessonStudentsInfo[lessonObj.objectId]), (obj) => obj.id);
        result[lessonObj.objectId] = getInfoItem(currentLessonStudents, currentStudent, scoreKey, getRankKey(isEquivalent, false));
    });
    return result;
}

function getRankKey(isEquivalent, isTotalScore) {
    return (isEquivalent) ? (isTotalScore ? 'equivalentRank' : 'equivalentLessonRank') : (isTotalScore ? 'rank' : 'lessonRank');
}

function getInfoItem(students, currentStudent, scoreKey, rankKey) {
    var orderedStudents = _.sortBy(students, scoreKey), totalCount = students.length;
    var targetStudent = _.find(students, (obj) => obj.id == currentStudent.value);
    var targetIndex = _.findIndex(orderedStudents, (obj) => obj.id == currentStudent.value);
    var over = _.round(_.divide(targetIndex, students.length), 2);
    var mean = _.round(_.mean(_.map(students, (obj) => obj[scoreKey])), 2);
    var top = _.last(orderedStudents)[scoreKey];
    var overOne = getOverMean(orderedStudents, 0.2, totalCount, scoreKey);
    var overTwo = getOverMean(orderedStudents, 0.4, totalCount, scoreKey);
    var overThree = getOverMean(orderedStudents, 0.6, totalCount, scoreKey);
    var overFour = getOverMean(orderedStudents, 0.8, totalCount, scoreKey);
    return {
        score: targetStudent[scoreKey],
        rank: targetStudent[rankKey],
        over: over,
        mean: mean,
        top: top,
        'over20%': overOne,
        'over40%': overTwo,
        'over60%': overThree,
        'over80%': overFour
    }
}

function getOverMean(orderedExamStudentsInfo, percentage, totalCount, scoreKey) {
    var tempCount = _.ceil(_.multiply(percentage, totalCount));
    var tempStudents = _.takeRight(orderedExamStudentsInfo, tempCount);
    return _.round(_.mean(_.map(tempStudents, (obj) => obj[scoreKey])), 2);
}

function getTableHeader(lessonsByStudent) {
    return _.concat(['名称', '总分'], _.map(lessonsByStudent, (obj) => obj.name));
}

function getTableData(rowKeys, orderedColumnKeys, tableInfo) {
    var rowData;
    return _.map(rowKeys, (rowKeyObj) => {
        rowData = _.map(orderedColumnKeys, (columnKey) => {
            return tableInfo[columnKey][rowKeyObj.id];
        });
        rowData.unshift(rowKeyObj.value);
        return rowData;
    });
}

