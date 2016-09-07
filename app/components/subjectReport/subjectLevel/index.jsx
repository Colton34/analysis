import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import {NUMBER_MAP as numberMap} from '../../../lib/constants';

export default function SubjectLevelModule({reportDS, currentSubject}) {
    var levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS();
    var currentPaperInfo = reportDS.examPapersInfo.toJS()[currentSubject.pid];
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var subjectLevelDistribution = makeCurrentSubjectSegmentsDistribution(subjectLevels, reportDS.examPapersInfo.toJS(), reportDS.allStudentsPaperMap.toJS());

    var levelTotalScores = _.reverse(_.map(levels, (obj) => obj.score));
    var currentSubjectLevelScores = _.reverse(_.map(subjectLevels, (sobj) => sobj[currentSubject.pid].mean));
    var currentSubjectLevelInfo = getCurrentSubjectLevelInfo(subjectLevelDistribution, currentSubject.pid);//注意：levelKey小的代表低档次
    var currentSubjectLevelRank = getCurrentSubjectLevelRank(subjectLevelDistribution, currentSubject.pid);//高档次名次在前
    var currentSubjectLevelClassInfo = getCurrentSubjectLevelClassInfo(subjectLevelDistribution, currentSubject.pid);

    var levelNumString = _.join(_.range(_.size(levels)).map(num => {return numberMap[num + 1]}), '、');
    return (
        <div className={commonClass['section']}>
            <div>
                <span className={commonClass['title-bar']}></span>
                <span className={commonClass['title']}>学科分档上线情况</span>
                <span className={commonClass['title-desc']} style={{ marginTop: 10 }}>通过科学的算法，将总分分档线分解到各学科，得到学科的分数线。</span>
            </div>
            <p>
                本次考试， 校管理者将总分分为{levelNumString}档分档线，分别而设置成{_.join(levelTotalScores.map(num => {return num + '分'}),'、')}。
                通过科学分解，{currentSubject.subject}学科的{levelNumString}档分数线分别是：{_.join(currentSubjectLevelScores.map(num => {return num + '分'}),'、')}。
            </p>
        </div>
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
            // var count = (low >= high) ? 0 : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high))).length) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low < obj.score) && (obj.score <= high))).length));
            var targets = (low >= high) ? [] : (levelKey == '0' ? (_.filter(allStudentsPaperMap[pid], (obj) => ((low <= obj.score) && (obj.score <= high)))) : (_.filter(allStudentsPaperMap[pid], (obj) => ((low < obj.score) && (obj.score <= high)))));
            currentLevelSubjectsDisInfo[pid] = {
                mean: obj.mean,
                count: targets.length,
                targets: targets
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

function getCurrentSubjectLevelInfo(subjectLevelDistribution, currentSubjectPid) {
    var result = {};
    _.each(subjectLevelDistribution, (obj, levelKey) => {
        result[levelKey] = _.pick(obj[currentSubjectPid], ['count', 'sumCount', 'sumPercentage']);
    });
    return result;
}

function getCurrentSubjectLevelRank(subjectLevelDistribution, currentSubjectPid) {
    //计算当前学科在各个分档线的排名--使用count，而不是sumCount
    var temp;
    var result = _.map(subjectLevelDistribution, (obj, levelKey) => {
        temp = _.map(obj, (sobj, pid) => {
            return {
                pid: pid,
                count: sobj.count,
                subject: sobj.subject
            }
        });
        temp = _.orderBy(temp, ['count'], ['desc']);
        return (_.findIndex(temp, (obj) => obj.pid == currentSubjectPid) + 1);
    });
    return _.reverse(result);
}

function getCurrentSubjectLevelClassInfo(subjectLevelDistribution, currentSubjectPid) {
    var result = {}, currentSubjectLevelStudentsGroup, temp;
    _.each(subjectLevelDistribution, (obj, levelKey) => {
        temp = {};
        currentSubjectLevelStudentsGroup = _.groupBy(obj[currentSubjectPid].targets, 'class_name');
        temp.totalSchool = obj[currentSubjectPid].targets.length;
        _.each(currentSubjectLevelStudentsGroup, (cstudents, classKey) => {
            temp[classKey] = cstudents.length;
        });
        result[levelKey] = temp;
    });
    return result;
}
