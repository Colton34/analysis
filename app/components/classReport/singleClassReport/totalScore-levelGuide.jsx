//分档分数线文案（总分分布趋势下面的那一小块）

import _ from 'lodash';
import React, { PropTypes } from 'react';

import commonClass from '../../../common/common.css';
import {NUMBER_MAP as numberMap} from '../../../lib/constants';

export default function LevelGuide({reportDS, classStudents}) {
    var levels = reportDS.levels.toJS(), examInfo = reportDS.examInfo.toJS(), studentsGroupByClass = reportDS.studentsGroupByClass.toJS();
    var fullMark = examInfo.fullMark;
    var maxScore = _.last(classStudents).score;
    var levTotal = _.size(levels);

    return (
        <div className={commonClass['section']}>
            <div style={{marginBottom: 25}}>
                <span className={commonClass['title']}>分档分数线</span>
                <span className={commonClass['title-desc']}>分档分数线默认为{numberMap[levTotal]}档，分别对应学生总数的{_.join(_.map(levels, (levObj) => levObj.percentage+'%'), '，')} 。</span>
            </div>
            <p style={{marginBottom: 0}}>本次考试满分{fullMark}分，最高分{maxScore}分，
            {
                    _.map(levels, (levObj, levelKey) => {
                        return (
                            <span key={'basicInfo-level-' + levelKey}>
                                {numberMap[(+levelKey + 1)]} 档线 {levels[(levTotal - 1 - levelKey) + ''].score}分{levelKey == levTotal - 1 ? '' : '，'}
                            </span>
                        )
                    })
            }
            </p>
        </div>
    );
}


//=================================================  分界线  =================================================
//Note: 数据已Ready
