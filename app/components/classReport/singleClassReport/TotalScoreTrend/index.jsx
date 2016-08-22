//总分分布趋势
import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../../common/common.css';
import {makeSegments, makeSegmentsCount} from '../../../../api/exam';
import StatisticalLib from 'simple-statistics';

//components
import InfoCards from './InfoCards';
import TrendChart from './TrendChart';

export default function Trend({reportDS, classStudents}) {
    var examInfo = reportDS.examInfo.toJS(), examStudentsInfo=reportDS.examStudentsInfo.toJS();
    var headerData = getHeaderData(examStudentsInfo);
    var chartDS = getChartDS(examInfo.fullMark, classStudents);
    var skewnessInfo = getSummaryInfo(classStudents);
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

function getSummaryInfo(classStudents) {
    var skewness = StatisticalLib.sampleSkewness(_.map(classStudents, (obj) => obj.score)).toFixed(2);
    if(skewness < -0.3) {
        return '以班级总分平均分来衡量，这次考试本班高于平均分的学生人数较多，相应高分段的学生人数密度来的较大，而低分段学生的成绩拉扯班级平均分较为显著，请班主任多关注底端的学生。鼓励他们提高总分水平，极有利于提高本班总平均分水平。';
    } else if(skewness < -0.05) {
        return '以班级总平均分来衡量，这次考试本班高于平均分的学生人数稍多一点，相应高分段的学生密度还是大一些。低分段学生的成绩对班级总分水平有一定的影响，鼓励他们提高总分水平，有利于提高本班的总平均水平。';
    } else if(skewness < 0.05) {
        return '以班级总平均分来衡量，这次考试本班处于总平均分两边的学生人数基本相当。总分分布比较对称。';
    } else if(skewness < 0.3) {
        return '以班级总分平均分来衡量，这次考试本班高于平均分的学生人数比平均分以下学生人数稍少一点，相应低分段学生人数密度稍大一些。但是高分度学生的总分水平比较给力，他们对全班总平均分的提高有较大贡献。';
    } else {
        return '以班级总分平均分来衡量，这次考试本班低于平均分的学生人数较多，相应高分段学生人数密来的较小。但是高分度学生的总分水平很给力，他们对全班总平均分的保持较高水平有极大贡献。';
    }
}
