//自定义分数段的人数分布

import React, { PropTypes } from 'react';

export default function CustomScoreSegment() {

}

//=================================================  分界线  =================================================
//参数：学科  分数段  对比的班级

function temp(currentSubject, currentScoreStep, currentCLasses, examPapersInfo, gradeName) {
    var chartDS = {}, tableDS = [];
    //通过currentScoreStep计算segments
    var segments = _.range(0, currentSubject.fullMark);
    segments.push(currentSubject.fullMark);
    //TODO: chart也需要构造x轴
    var tableHeader = getTableHeader(segments);
    tableDS.push(tableHeader);
//当前科目
    //所选择的班级，所划分的区间段
    var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[currentSubject.id], 'class');
    _.each(currentCLasses, (className) => {
        var temp = makeSegmentsCount(paperStudentsGroupByClass[className], segments);
        temp = _.reverse(temp);
        temp.unshift(gradeName+className+'班');
        tableDS.push(temp);
        chartDS[className] = temp;//要踢出第一个不是数字的数据
    });
    return chartDS;
}

function getTableHeader(segments) {
    var header =  _.map(_.range(segments.length-1), (index) => {
        return '' + segments[index] + '-' + segments[index+1] + '分';
    });
    header = _.reverse(header);
    header.unshift('班级');
    return header;
}
