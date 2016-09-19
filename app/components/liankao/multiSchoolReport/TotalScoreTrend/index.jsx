import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import {makeSegmentsDistribution, makeSegments} from '../../../../sdk';
import StatisticalLib from 'simple-statistics';

import InfoCards from './InfoCards';
import TrendChart from './TrendChart';

export default function Trend({reportDS}) {
    var examInfo = reportDS.examInfo.toJS();
    var examStudentsInfo = reportDS.examStudentsInfo.toJS();

    var headerData = getHeaderData(examStudentsInfo);
    var chartDS = getChartDS(examInfo.fullMark, examStudentsInfo);
    var skewnessInfo = getSummaryInfo(examStudentsInfo);
    return (
        <div id='totalScoreTrend' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>总分分布</span>
            <span className={commonClass['title-desc']}>学生总分分布，可反映本次联考学生的综合学业水平分布状态</span>

            <InfoCards headerData={headerData}/>
            <div style={{marginTop: 30}}>
                <TrendChart chartDS={chartDS} examInfo={examInfo} examStudentsInfo={examStudentsInfo}/>
                <FullScoreInfo yData={chartDS['y-axon']}/>
                <div style={{clear: 'both'}}></div>
            </div>
            <div className={commonClass['analysis-conclusion']}>
                <p>分析诊断：</p>
                <div>{skewnessInfo}</div>
            </div>
        </div>
    )
}

/**
 * props:
 * yData: highChart图数据的y轴数据
 */
class FullScoreInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showScroll : false,
            needScroll: this.props.yData.length > 8 ? true : false  //列表超过8个就会需要滚动条
        }
    }
    onMouseEnter() {
        if (!this.state.needScroll) return;
        this.setState({showScroll: true})
    }
    onMouseLeave() {
        if (!this.state.needScroll) return ;
        this.setState({showScroll: false});
    }
    render() {
        var {yData} = this.props;
        return (
            <ul style={_.assign({ width: 240, height: 360, padding: '20px 0 40px 10px', marginBottom: 0, backgroundColor: colorsMap.C14, border: '1px solid ' + colorsMap.C04, float: 'right',listStyleType: 'none', fontSize: 12 }, this.state.showScroll ? { overflowY: 'scroll'}: {overflowY: 'hidden'})} onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
                {
                    yData.map((data, index) => {
                        return (
                            <li key={'fullScoreTrend-li-' + index} style={{height: 40, lineHeight: '40px', display: 'table-row' }}>
                                <span className={commonClass['list-dot']} style={{ width: 20, height: 40, lineHeight: '40px', textAlign: 'center', display: 'table-cell', verticalAlign: 'middle'}}></span>
                                <span style={{ marginRight: 20, display: 'table-cell', width: 110, textAlign: 'left', borderBottom: '1px dashed ' + colorsMap.C04}}>{(index === 0 ? '[' + data.low : '(' + data.low) + ',' + data.high + ']分区间'}</span>
                                <span style={{ marginRight: 20, display: 'table-cell', width: 50, textAlign: 'left',  borderBottom: '1px dashed ' + colorsMap.C04}}>{data.y}</span>
                                <span style={{ display: 'table-cell', textAlign: 'left', borderBottom: '1px dashed ' + colorsMap.C04, }}>人</span>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }
 }

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

function getChartDS(fullMark, examStudentsInfo) {
    var segments = makeSegments(fullMark);
    var xAxons = _.slice(segments, 1);
    var segmentDistribution = makeSegmentsDistribution(segments, examStudentsInfo, 'score');
    var yAxons = getYAxonsDS(segmentDistribution, xAxons);
    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

function getYAxonsDS(segmentDistribution) {
    return _.map(segmentDistribution, (obj, index) => {
        var temp = _.pick(obj, ['low', 'high']);
        if(index == 0) temp.first = true;
        temp['y'] = obj.count;
        return temp;
    });
}

function getSummaryInfo(examStudentsInfo) {
    var skewness = _.round(StatisticalLib.sampleSkewness(_.map(examStudentsInfo, (obj) => obj.score)), 2);
    if(skewness < -0.3) {
        return '以联考总分平均分来衡量，这次考试本年级高于平均分的学生人数较多，相应高分段的学生人数密度来的较大，而低分段学生的成绩拉扯联考总分平均分较为显著，请提醒各学校多关注底端的学生。';
    } else if(skewness < -0.05) {
        return '以联考总平均分来衡量，这次考试联考总体高于平均分的学生人数稍多一点，相应高分段的学生密度还是大一些。低分段学生的成绩对联考总体总分水平有一定的影响，鼓励他们提高总分水平，有利于提高本联考区域的总平均水平。';
    } else if(skewness < 0.05) {
        return '以联考总平均分来衡量，这次考试联考总体处于总平均分两边的学生人数基本相当。总分分布比较对称。';
    } else if(skewness < 0.3) {
        return '以联考总分平均分来衡量，这次考试联考总体高于平均分的学生人数比平均分以下学生人数稍少一点，相应低分段学生人数密度稍大一些。但是高分度学生的总分水平比较给力，他们对联考总体总平均分的提高有较大贡献。';
    } else {
        return '以联考总分平均分来衡量，这次考试联考总体低于平均分的学生人数较多，相应高分段学生人数密来的较小。但是高分度学生的总分水平很给力，他们对联考总体总平均分的保持较高水平有极大贡献。';
    }
}
