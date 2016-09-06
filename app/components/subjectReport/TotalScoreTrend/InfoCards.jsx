import _ from 'lodash';
import React from 'react';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function InfoCards ({currentPaperInfo, currentPaperStudentsInfo}) {
    var scoreInfo = getHeaderData(currentPaperStudentsInfo);
    return (
        <div style={{marginTop: 30}}>
            试卷共  35 道题目，主观题  30 道，分值占比 60%，客观题 5 道，分值占比 40%；学科总分 {currentPaperInfo.fullMark}，本次考试年级最高分 {scoreInfo.maxScore} 分，最低分 {scoreInfo.minScore} 分，年级平均分 {scoreInfo.avgScore} 分。
        </div>
    )
}


function getHeaderData(currentPaperStudentsInfo) {
    var avgScore = _.round(_.mean(_.map(currentPaperStudentsInfo, (obj) => obj.score)), 2);
    var maxScore = _.last(currentPaperStudentsInfo).score;
    var minScore = _.first(currentPaperStudentsInfo).score;
    return {
        maxScore: maxScore,
        minScore: minScore,
        avgScore: avgScore
    }
}
