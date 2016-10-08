//自定义分数段的人数分布
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../../common/common.css';

import DropdownList from '../../../../common/DropdownList';
import SegmentDetailChart from './SegmentDetailChart';
import SegmentDetailTable from './SegmentDetailTable';

import {makeSegmentsCount} from '../../../../api/exam';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';

class CustomScoreSegment extends React.Component {
    constructor(props) {
        super(props);
        this.examPapersInfo = this.props.reportDS.examPapersInfo.toJS();
        this.allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        var examInfo = this.props.reportDS.examInfo.toJS();
        this.gradeName = examInfo.gradeName;
        this.examName = examInfo.name;
        var examClassesInfo = this.props.reportDS.examClassesInfo.toJS();
        var examClassKeys = _.keys(examClassesInfo);
        var headers = this.props.reportDS.headers.toJS();
        this.formatedSubjects = getFormatedSubjects(headers);
        this.state = {
            currentSubject: this.formatedSubjects[0], //subject
            currentScoreStep: 10, //segment
        }
        // 当科目变更时，segmentDetailChart的班级下拉菜单需要刷新:
        this.dropdownListRefresh = false;
    }

    segmentInputBlur(event) {
        var value = parseInt(event.target.value);
        console.log('input value:' + value);
        if (isNaN(value) || value === this.state.segment || value <= 0) return;
        this.setState({
            currentScoreStep: value
        })
    }

    onChooseSubject(item) {
        this.dropdownListRefresh = true;
        this.setState({
            currentSubject: item
        })
    }
    // 向子组件传递一个handler，以改变dropdownListRefresh的状态；
    dropdownListRefreshHandler() {
        this.dropdownListRefresh = false;
    }
    render() {
        var {chartDS, tableDS, segments} = getDS(this.state.currentSubject, this.state.currentScoreStep, this.examPapersInfo, this.allStudentsPaperMap, this.gradeName);
        var formatedDS = getformatedDS(segments, tableDS);

        var formatedClassList = getFormatedClassList(this.examPapersInfo[this.state.currentSubject.id].realClasses, this.gradeName); //这场考试下面的班级
        var formatedSubjects = this.formatedSubjects;
        return (
            <div id='customScoreSegment' className={commonClass['section']}>
                <div style={{marginBottom: 20}}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>自定义分数段的人数分布</span>
                    <span className={commonClass['title-desc']}></span>
                </div>
                <div style={{display: 'table-cell', paddingLeft: 18,verticalAlign: 'middle', width: 1200, height: 70, lineHeigth: 70, border: '1px solid ' + colorsMap.C05, background: colorsMap.C02, borderRadius: 3,position:'relative'}}>
                    您查看的科目为
                    <DropdownList list={formatedSubjects} style={{margin: '0 10px', display: 'inline-block',position:'absolute',zIndex:1}}
                                surfaceBtnStyle={{border: '1px solid ' + colorsMap.C08, color: colorsMap.C12}}
                                onClickDropdownList={this.onChooseSubject.bind(this)}
                            />
                          <div style={{margin: '0 10px 0 110px', display: 'inline-block'}}>本科满分为{this.state.currentSubject.fullMark}分,您可以设置
                    <input defaultValue={this.state.currentScoreStep} onBlur={this.segmentInputBlur.bind(this)} style={{width: 70, height: 30, margin: '0 10px', paddingLeft: 10, border: '1px solid ' + colorsMap.C08}}/>为一个分数段，查看不同分数段的人数分布及详情</div>
                </div>
                <SegmentDetailChart chartData={formatedDS} classList={formatedClassList} needRefresh={this.dropdownListRefresh} dropdownListRefreshHandler={this.dropdownListRefreshHandler.bind(this)}/>
                <SegmentDetailTable tableHeaders={formatedDS.tableHeader} tableData={formatedDS.tableData} currentSubject={this.state.currentSubject} examName={this.examName} gradeName={this.gradeName}/>
            </div>
        )
    }
}

export default CustomScoreSegment;
//=================================================  分界线  =================================================
function getDS(currentSubject, currentScoreStep, examPapersInfo, allStudentsPaperMap, gradeName) {
    var chartDS = {}, tableDS = [];
    //通过currentScoreStep计算segments
    var segments = _.range(0, currentSubject.fullMark, currentScoreStep);
    segments.push(currentSubject.fullMark);
    //TODO: chart也需要构造x轴
    var tableHeader = getTableHeader(segments);
    debugger;
    tableDS.push(tableHeader);
//当前科目
    //所选择的班级，所划分的区间段
    var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[currentSubject.id], 'class_name');
    _.each(_.keys(paperStudentsGroupByClass), (className) => {
        var temp = makeSegmentsCount(paperStudentsGroupByClass[className], segments);
        temp = _.reverse(temp);
        temp.unshift(gradeName+className+'班');
        tableDS.push(temp);
        chartDS[className] = temp.slice(1);//要踢出第一个不是数字的数据
    });
    return {chartDS: chartDS, tableDS: tableDS, segments: segments};
}

function getformatedDS(segments, tableDS) {
    debugger;
    var categories = getCategories(tableDS);
    debugger;
    var tableHeader = getTableHeader(segments);
    var tableData = getTableData(tableDS);
    var series = getSeriesData(tableDS);
    return {
        categories: categories,
        tableHeader: tableHeader,
        tableData: tableData,
        series: series
    }
}

function getCategories(tableDS) {
    return _.reverse(_.map(_.slice(tableDS[0], 1, _.size(tableDS[0])), (obj) => obj.name));
}

function getTableHeader(segments) {
    var categories = [];
    var header =  _.map(_.range(segments.length-1), (index) => {
        var afefix = (index == segments.length-2) ? ']' : ')';
        var value = '[' + segments[index] + '-' + segments[index+1] + afefix + '分';
        categories.push(value);
        return {id: value, name: value};
    });
    _.reverse(header);
    header.unshift({id: 'class', name: '班级'});
    return header;
    // return {header: header, categories: categories};
}

function getTableData(tableDS) {
    var theKeys = tableDS[0];
    return _.map(_.range(_.size(tableDS)-1), (index) => {
        var rowData = tableDS[index+1];
        var obj = {};
        _.each(rowData, (v, i) => {
            obj[theKeys[i].id] = v;
        });
        return obj;
    });
}

function getSeriesData(tableDS) {
    return _.map(_.range(_.size(tableDS)-1), (index) => {
        var rowData = tableDS[index+1];
        var className = rowData[0];
        var data = _.slice(rowData, 1, rowData.length);
        _.reverse(data);
        return {
            name: className,
            data: data
        }
    })
}

function getFormatedClassList(classNames, gradeName) {
    return _.map(classNames, (cname) => {
        return {value: gradeName+cname+'班', key: cname}
    })
}

function getFormatedSubjects(headers) {
    return _.map(_.slice(headers, 1), (headerObj) => {
        return {value: headerObj.subject, totalScore: headerObj.fullMark, fullMark: headerObj.fullMark, id: headerObj.id} //TODO:这个命名有问题，需要改！
    })
}


//==================  Mock Data
// var subjects = [{value: '语文', totalScore: 150}, {value: '数学', totalScore: 160}, {value: '英语', totalScore: 120}];

// var classList = [{value:'初一1班'}, {value:'初一2班'}, {value:'初一3班'}, {value:'初一4班'}, {value:'初一5班'}];

// var scoreCache = {};

// _.forEach(subjects, subject => {
//     scoreCache[subject.value] = {};
//     _.forEach(classList, classObj => {
//         scoreCache[subject.value][classObj.value] = _.range(parseInt(Math.random()* 60 + 11)).map(num=>{return parseInt(Math.random() * subject.totalScore)})
//     })
// })

// Mock DS
// tableHeaders: [
//     [{id: 'class', name: '班级'}, {id: "(135-150]分", name: "(135-150]分"}, ...]
// ]

// tableData:
//     [
//         {
//             "(15-30]分":6
//             "(30-45]分":5
//             "(45-60]分":7
//             "(60-75]分":10
//             "(75-90]分":13
//             "(90-105]分":6
//             "(105-120]分":6
//             "(120-135]分":9
//             "(135-150]分":5
//             "[0-15]分":3
//             "class":"初一1班"
//         },
//         ...//每个班级
//     ],


// series: [
//     {
//         name: '初一1班',
//         data: [5, 9, 6, 6, 13, 10, 7, 6, 5, 3]
//     },
//     ...//每个班级
// ]

// categories: ["[0-15]分", "(15-30]分", "(30-45]分", "(45-60]分", "(60-75]分", "(75-90]分", "(90-105]分", "(105-120]分", "(120-135]分", "(135-150]分"]
