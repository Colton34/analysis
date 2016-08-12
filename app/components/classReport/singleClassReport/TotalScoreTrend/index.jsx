//总分分布趋势
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../../common/common.css';
import {makeSegments, makeSegmentsCount} from '../../../../api/exam';

//components
import InfoCards from './InfoCards';
import TrendChart from './TrendChart';

export default function Trend({reportDS, classStudents}) {
    var examInfo = reportDS.examInfo.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS();
    var headerData = getHeaderData(examStudentsInfo);
    var chartDS = getChartDS(examInfo.fullMark, classStudents);
    return (
        <div id='totalScoreTrend' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>总分分布趋势</span>
            <span className={commonClass['title-desc']}>学生总分分布趋势，可反映本次考试班级学生的综合学习水平</span>

            <InfoCards headerData={headerData}/>
            <TrendChart chartDS={chartDS} examInfo={examInfo} />
        </div>
    )
}



//=================================================  分界线  =================================================
function getHeaderData(examStudentsInfo) {
    var avgScore = _.round(_.mean(_.map(examStudentsInfo, (obj) => obj.score)), 2);
    var maxScore = _.last(examStudentsInfo).score;
    var minScore = _.first(examStudentsInfo).score;
    return {
        maxScore: maxScore,
        minScore: minScore,
        avgScore: avgScore
    }
}

function getChartDS(fullMark, classStudents) {
    var segments = makeSegments(fullMark);

    var xAxons = _.slice(segments, 1);
    var segmentCounts = makeSegmentsCount(classStudents, segments);
    var yAxons = getYAxonsDS(segmentCounts, xAxons);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function getYAxonsDS(segmentCounts, xAxons) {
    var newXAxons = _.concat([0], xAxons);
    return _.map(segmentCounts, (count, index) => {
        var temp = {};
        if(index == 0) temp['first'] = true;
        temp['y'] = count;
        temp['low'] = newXAxons[index];
        temp['high'] = newXAxons[index+1];
        return temp;
    });
}
