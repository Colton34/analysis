import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

// import {makeSegmentsDistribution} from '../../../sdk';

export default function SubjectLevelModule({reportDS, currentSubject}) {
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentSubject.pid];
    debugger;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    debugger;
    // var subjectLevelSegmentsInfo = getSubjectLevelSegmentsInfo(reportDS.subjectLevels.toJS(), currentPaperInfo.fullMark, currentSubject.pid);
    // debugger;
    var subjectLevelDistribution = makeCurrentSubjectSegmentsDistribution(reportDS.subjectLevels.toJS(), reportDS.examPapersInfo.toJS(), reportDS.allStudentsPaperMap.toJS());
    debugger;
}

//计算各个档次，各个科目在此档次的人数分布--不是累计，后面有累计
/*

{
    <levelKey>: {
        <pid>: {mean: , count: }
    }
}

然后再填充sumCount信息和sumPercentage的信息，得到最终的DS

 */


function makeCurrentSubjectSegmentsDistribution(subjectLevels, examPapersInfo, allStudentsPaperMap) {
    //过滤，计算相应的人数。Note:由于样本的关系，可能会出现低档次的某科目平均分高于高档次，此种情况把count【暂时】设置为0，待补充算法
    //最低档次线是两边闭合，其他档次都是左开右合
    var result = {};
    _.each(subjectLevels, (subLevObj, levelKey) => {
        var currentLevelSubjectsDisInfo = {};
        _.each(subLevObj, (obj, pid) => {
            var low = obj.mean;
            var high = (subjectLevels[parseInt(levelKey)+1+'']) ? subjectLevels[parseInt(levelKey)+1+''][pid].mean : examPapersInfo[pid].fullMark;
            var count = (low >= high) ? 0 : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => (low <= obj.score <= high)).length) : (_.filter(allStudentsPaperMap[pid], (obj) => (low < obj.score <= high)).length));
            currentLevelSubjectsDisInfo[pid] = {
                mean: obj.mean,
                count: count
            }
        });
        result[levelKey] = currentLevelSubjectsDisInfo;
    });
}
