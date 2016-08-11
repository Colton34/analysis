//自定义分数段的人数分布
import _ from 'lodash';
import React, { PropTypes } from 'react';

import {makeSegmentsCount} from '../../../api/exam';

// export default function CustomScoreSegment({reportDS}) {

// }

class CustomScoreSegment extends React.Component {
    constructor(props) {
        super(props);
        this.examPapersInfo = this.props.reportDS.examPapersInfo.toJS();
        this.allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        this.gradeName = this.props.reportDS.examInfo.toJS().gradeName;
        var examClassesInfo = this.props.reportDS.examClassesInfo.toJS();
        var examClassKeys = _.keys(examClassesInfo);
        var currentClasses = _.take(examClassKeys, 2);
        this.state = {
            currentSubject: this.examPapersInfo[_.keys(this.examPapersInfo)[0]],
            currentScoreStep: 75,
            currentClasses: currentClasses
        }
    }

    render() {
        var {chartDS, tableDS} = getDS(this.state.currentSubject, this.state.currentScoreStep, this.state.currentClasses, this.examPapersInfo, this.allStudentsPaperMap, this.gradeName);
        debugger;
        return (
            <div></div>
        );
    }
}

export default CustomScoreSegment;

//=================================================  分界线  =================================================
function getDS(currentSubject, currentScoreStep, currentClasses, examPapersInfo, allStudentsPaperMap, gradeName) {
    var chartDS = {}, tableDS = [];
    //通过currentScoreStep计算segments
    var segments = _.range(0, currentSubject.fullMark, currentScoreStep);
    segments.push(currentSubject.fullMark);
    //TODO: chart也需要构造x轴
    var tableHeader = getTableHeader(segments);
    tableDS.push(tableHeader);
//当前科目
    //所选择的班级，所划分的区间段
    var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[currentSubject.id], 'class_name');
    _.each(currentClasses, (className) => {
        var temp = makeSegmentsCount(paperStudentsGroupByClass[className], segments);
        temp = _.reverse(temp);
        temp.unshift(gradeName+className+'班');
        tableDS.push(temp);
        chartDS[className] = temp.slice(1);//要踢出第一个不是数字的数据
    });
    return {chartDS: chartDS, tableDS: tableDS};
}

function getTableHeader(segments) {
    var header =  _.map(_.range(segments.length-1), (index) => {
        return '' + segments[index+1] + '-' + segments[index] + '分';
    });
    header = _.reverse(header);
    header.unshift('班级');
    return header;
}
