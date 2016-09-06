import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

// import {makeSegmentsDistribution} from '../../../sdk';

export default function SubjectLevelModule({reportDS, currentSubject}) {
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentSubject.pid];
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var subjectLevelDistribution = makeCurrentSubjectSegmentsDistribution(reportDS.subjectLevels.toJS(), reportDS.examPapersInfo.toJS(), reportDS.allStudentsPaperMap.toJS());
    debugger;
    return (
        <div>待填充</div>
    )
}

/*
{
    <levelKey>: {
        <pid>: {mean: , count: , sumCount: , sumPercentage: }
    }
}
*/
function makeCurrentSubjectSegmentsDistribution(subjectLevels, examPapersInfo, allStudentsPaperMap) {
    //计算各个档次，各个科目在此档次的人数分布--不是累计，后面有累计
    var result = makeCurrentSubjectSegmentCountInfo(subjectLevels, examPapersInfo, allStudentsPaperMap);
    //然后再填充sumCount信息和sumPercentage的信息，得到最终的DS
    fillSubjectSumInfo(result, allStudentsPaperMap);
    return result;
}

function makeCurrentSubjectSegmentCountInfo(subjectLevels, examPapersInfo, allStudentsPaperMap) {
    //过滤，计算相应的人数。Note:由于样本的关系，可能会出现低档次的某科目平均分高于高档次，此种情况把count【暂时】设置为0，待补充算法
    //最低档次线是两边闭合，其他档次都是左开右合
    var result = {};
    _.each(subjectLevels, (subLevObj, levelKey) => {
        var currentLevelSubjectsDisInfo = {};
        _.each(subLevObj, (obj, pid) => {
            var low = obj.mean;
            var high = (subjectLevels[parseInt(levelKey)+1+'']) ? subjectLevels[parseInt(levelKey)+1+''][pid].mean : examPapersInfo[pid].fullMark;
            var count = (low >= high) ? 0 : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high))).length) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low < obj.score) && (obj.score <= high))).length));
            currentLevelSubjectsDisInfo[pid] = {
                mean: obj.mean,
                count: count
            }
        });
        result[levelKey] = currentLevelSubjectsDisInfo;
    });
    return result;
}

function fillSubjectSumInfo(originalResult, allStudentsPaperMap) {
    _.each(originalResult, (subjectsInfo, levelKey) => {
        _.each(subjectsInfo, (obj, pid) => {
            obj.sumCount = (levelKey == '0') ? (obj.count) : (originalResult[levelKey-1][pid].sumCount + obj.count);
            obj.sumPercentage = _.round(_.divide(obj.sumCount, allStudentsPaperMap[pid].length), 2);
        });
    });
}
