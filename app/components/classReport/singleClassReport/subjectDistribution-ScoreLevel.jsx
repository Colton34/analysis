//学科分档学生人数分布
import _ from 'lodash';
import React, { PropTypes } from 'react';

import TableView from '../../../common/TableView';

import commonClass from '../../../common/common.css';
import singleClassReportStyle from './singleClassReport.css';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';

/**-------------------------------mock data-------------------------------------------- */
var subjectPerformance = {high: '语文', low: '政治'};
/**-------------------------------mock data end-------------------------------------------- */
class SubjectLevelDisribution extends React.Component {
    constructor(props) {
        super(props);

//TODO:科目跟着这个班走！
        var {classStudents, classStudentsPaperMap, classHeadersWithTotalScore, currentClass, reportDS} = this.props;
        var levels = reportDS.levels.toJS(), subjecLevels = reportDS.subjectLevels.toJS(), gradeName = reportDS.examInfo.toJS().gradeName, allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        this.levels = levels;
        var theDS = getDS(levels, subjecLevels, classHeadersWithTotalScore, gradeName, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap);
        this.theDS = theDS;

        this.state = {
            activeTab: 0
        }
    }
    switchTab(num) {
        console.log('switch tab: ' + num);
        this.setState({
            activeTab: num
        })
    }
    render() {
        var {activeTab} = this.state;
        var levelLastIndex = _.size(this.levels) - 1;
        var currentLevelDS = this.theDS[(levelLastIndex - activeTab)];
        var tableDS = currentLevelDS.tableDS;
        var countSubjectDS = getSubjectDS(currentLevelDS.bestAndWorst);
        var percentageSubjectDS = currentLevelDS.percentageSubjectDS; //TODO:新增，需要响应的文案

        return (
            <div id='scoreLevel' className={commonClass['section']}>
                <div>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>学科分档人数分布</span>
                    <div className={commonClass['title-desc']} style={{marginTop: 10}}>运用大数据分析算法将总分分档分数精准地分解到学科中，得出各学科的分档分数线及其分档上线人数分布，可反映出班级在学科的上线情况。学科上线人数越多，该学科对学生总分上线提供了更大的可能性。</div>
                </div>
                {/****************** 切换标签 *************** */}
                <div className='tab-ctn'>
                    <ul>
                        {
                            _.range(_.size(this.levels)).map((num) => {
                                return (
                                    <li key={'levelInfo-li-' + num} onClick={this.switchTab.bind(this, num) } className={'fl ' + (num === this.state.activeTab ? 'active' : '') } data-num={num}>{numberMap[num + 1]}档线上线学生人数分布</li>
                                )
                            })
                        }
                    </ul>
                </div>
                {/** *************表格***********/}
                <TableView tableData={tableDS}/>
                <div className={singleClassReportStyle['analysis-conclusion']}>
                    <div>分析诊断：</div>
                    <div style={{marginBottom: 20}}>
                    {/**-------------------------------todo： 补充真实数据 --------------------------------------- */}
                        从提供{numberMap[activeTab + 1]}档上线人数来看，本班{<span style={{color: colorsMap.B03}}>{percentageSubjectDS.high}</span>}学科表现较佳，{<span style={{color: colorsMap.B03}}>{percentageSubjectDS.low}</span>}表现不足。
                        从学生上线人数占比（本班级/全年级）来看，{<span style={{color: colorsMap.B03}}>{percentageSubjectDS.high}</span>}学科表现不差，{<span style={{color: colorsMap.B03}}>{percentageSubjectDS.low}</span>}学科表现不足。
                    </div>
                    <div style={{fontSize: 12}}>查看班级学生上线人数与学生上线人数占比，分别从绝对数与相对数不同的方面反映出学科的贡献。仅看班级学生上线人数这个绝对数的表现，容易忽略全年级整体而言学科的表现情况，不够全面。</div>
                </div>
            </div>
        )
    }
}
export default SubjectLevelDisribution;

//=================================================  分界线  =================================================
//各个档次的table数据以及各个档次的文案数据
function getDS(levels, subjecLevels, classHeadersWithTotalScore, gradeName, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap) {
    var result = {};
    _.each(levels, (levObj, levelKey) => {
        var subjectLevelMeanInfo = subjecLevels[levelKey];   //_.find(subjecLevels, (obj) => obj.levelKey == levelKey);
        if(!subjectLevelMeanInfo) return;

        var currentSubjectLevelInfo = makeCurrentSubjectLevelInfo(subjectLevelMeanInfo, levObj, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap);
        var {validOrderedSubjectMean} = filterMakeOrderedSubjectMean(levObj, classHeadersWithTotalScore, subjectLevelMeanInfo);
        var tableDS = getTableDS(currentSubjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass);
        var bestAndWorst = getBestAndWorst(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo);
        var percentageSubjectDS = getPercentageBetterAndWorse(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo);
        result[levelKey] = {tableDS: tableDS, bestAndWorst: bestAndWorst, percentageSubjectDS: percentageSubjectDS}
    });
    return result;
}

function getBestAndWorst(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo) {
    var data = currentSubjectLevelInfo[currentClass];    //subjectLevelMap = _.keyBy(currentSubjectLevels, 'id');
    var best = {}, worst = {};
    _.each(data, (count, key) => {
        if(key == 'totalScore') return;
        if(!best.pid || count > best.count) best = {pid: key, count: count, subject: subjectLevelMeanInfo[key].name};
        if(!worst.pid || count < worst.count) worst = {pid: key, count: count, subject: subjectLevelMeanInfo[key].name};
    });
    return {best: best, worst: worst};
}

function getSubjectDS(bestAndWorst) {
    return {
        high: bestAndWorst.best.subject,
        low: bestAndWorst.worst.subject
    }
}

function getPercentageBetterAndWorse(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo) {
    var temp = [], classSubjectCounts = currentSubjectLevelInfo[currentClass], schoolSubjectCounts = currentSubjectLevelInfo['totalSchool'];
    _.each(classSubjectCounts, (count, pid) => {
        if(pid == 'totalScore') return;
        if(_.isNumber(count) && _.isNumber(schoolSubjectCounts[pid])) temp.push({value: _.round(_.multiply(_.divide(count, schoolSubjectCounts[pid]), 100), 2), subject: subjectLevelMeanInfo[pid].name});
    });
    temp = _.sortBy(temp, 'value');
    return {
        high: _.last(temp).subject,
        low: _.first(temp).subject
    }
}

/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} classHeadersWithTotalScore         [description]
 * @return {[type]}                 [description]
 */
function getTableDS(subjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass) {
    var table = [];
    var titleHeader = _.map(validOrderedSubjectMean, (headerObj, index) => {
        return headerObj.subject + '(' + headerObj.mean + ')';
    });
    titleHeader.unshift('班级');

   var currentClassObj = subjectLevelInfo[currentClass];
    var currentClassCountRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return (_.isUndefined(currentClassObj[headerObj.id])) ? '无数据' : currentClassObj[headerObj.id];
    });
    // currentClassCountRow.unshift(gradeName + currentClass + '班');
    currentClassCountRow.unshift('本班上线人数');
    table.push(currentClassCountRow);

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return (_.isUndefined(totalSchoolObj[headerObj.id])) ? '无数据' : totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全年级上线人数');
    table.push(totalSchoolRow);

    var currentClassPercentageRow = getCurrentClassPercentageRow(currentClassCountRow, totalSchoolRow);
    currentClassPercentageRow.unshift('本班/全年级');

    table.unshift(titleHeader);

    return table;
}

function getCurrentClassPercentageRow(currentClassCountRow, totalSchoolRow) {
    var classCounts = _.slice(currentClassCountRow, 1), totalCounts = _.slice(totalSchoolRow, 1);
    return _.map(classCounts, (classCount, index) => {
        return (_.isNumber(classCount) && _.isNumber(totalCounts[index])) ? (_.round(_.multiply(_.divide(classCount, totalCounts[index]), 100), 2))+'%' : '无数据';
    });
}

/**
 * 创建学科分析需要的info数据结构
 * @param  {[type]} currentSubjectLevels [description]
 * @param  {[type]} levObj               [description]
 * @return {[type]}                      info格式的学科分析的数据结构
 * {
 *     totalSchool: {
 *         totalScore: <count>
 *         <pid>: <count>
 *
 *     },
 *     <className>: {
 *         totalScore: <count>
 *         <pid>: <count>
 *     },
 *     ...
 * }
 */
function makeCurrentSubjectLevelInfo(subjectLevelMeanInfo, levObj, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap) {
    var currentSubjectLevelInfo = {};
    currentSubjectLevelInfo.totalSchool = {};
    currentSubjectLevelInfo.totalSchool.totalScore = levObj.count;
    _.each(subjectLevelMeanInfo, (subMeanInfo, pid) => {
        currentSubjectLevelInfo.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score > subMeanInfo.mean).length;
    });
    var temp = {};
    temp.totalScore = _.filter(classStudents, (student) => student.score > levObj.score).length;
    _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
        temp[pid] = _.filter(papers, (paper) => paper.score > subjectLevelMeanInfo[pid].mean).length;
    });
    currentSubjectLevelInfo[currentClass] = temp;
    return currentSubjectLevelInfo;
}

//TODO:抽取出来，作为Common Report Util
function filterMakeOrderedSubjectMean(levObj, classHeadersWithTotalScore, subjectLevelMeanInfo) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var valids = [], unvalids = [];
    _.each(classHeadersWithTotalScore, (headerObj) => {
        if(headerObj.id == 'totalScore') return;
        if(subjectLevelMeanInfo[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        }
    });
    valids.unshift({id: 'totalScore', subject: '总分', mean: levObj.score});
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}
