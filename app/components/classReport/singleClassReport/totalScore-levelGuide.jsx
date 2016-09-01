//分档分数线文案（总分分布趋势下面的那一小块）
import _ from 'lodash';
import React, { PropTypes } from 'react';

import commonClass from '../../../common/common.css';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';
import {initParams} from '../../../lib/util';

import {Modal} from 'react-bootstrap';
var {Header, Title, Body, Footer} = Modal;

var localStyle = {
    dialogInput: {width: 100,height: 34, border: '1px solid #e7e7e7', borderRadius: 2, paddingLeft: 12, margin: '0 10px 0 0'},
    btn: {lineHeight: '32px', width: 84, height: 32,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2',color: '#6a6a6a', margin: '0 6px'},
}

export default class LevelGuide extends React.Component  {
    constructor(props) {
        super(props);
    }

    render() {
        var {reportDS, classStudents} = this.props;
        var levels = reportDS.levels.toJS(),
            examInfo = reportDS.examInfo.toJS();
        var fullMark = examInfo.fullMark;
        var maxScore = _.last(classStudents).score;
        var levTotal = _.size(levels);
        var ifCanReviewMultiReport = this.props.ifCanReviewMultiReport;
        return (
            <div className={commonClass['section']}>
                <div style={{ marginBottom: 20 }}>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>分档分数线划定</span>
                    <div className={commonClass['title-desc']} style={{ marginTop: 10 }}>
                        将总分划线进行分档分析是常用的分析方法，特别适合高考、中考的模拟考试。即便是对日常期中期末考试，通过总分分档分析，也能考察高端学生综合水平的分布情况。
                        总分分数线应由学校统一设置，未设置前，由本分析系统默认设置。
                    </div>
                </div>

                <p style={{ marginBottom: 0 }}>本次考试满分{fullMark}分，最高分{maxScore}分，整体分为{numberMap[levTotal]}档，
                    {
                        _.map(levels, (levObj, levelKey) => {
                            return (
                                <span key={'basicInfo-level-' + levelKey}>
                                    {numberMap[(+levelKey + 1)]} 档线 {levels[(levTotal - 1 - levelKey) + ''].score}分{levelKey == levTotal - 1 ? '' : '，'}
                                </span>
                            )
                        })
                    }
                   。分别对应年级学生总数的前
                    {
                        _.map(levels, (levObj, levelKey) => {
                            return levels[(levTotal - 1 - levelKey)].percentage + '%' + (levelKey == levTotal - 1 ? '' : '、')
                        })
                    }
                    {ifCanReviewMultiReport? '。如需修改，请在校级报告中修改。': '。如需修改，请联系管理员。'}

                </p>
            </div>
        );
    }

}
//=================================================  分界线  =================================================
//Note: 数据已Ready
