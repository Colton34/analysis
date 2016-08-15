//学科分档学生人数分布
import _ from 'lodash';
import React, { PropTypes } from 'react';

import TableView from '../../../common/TableView';

import commonClass from '../../../common/common.css';
import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';

class SubjectLevelDisribution extends React.Component {
    constructor(props) {
        super(props);

//TODO:科目跟着这个班走！
        var {classStudents, classStudentsPaperMap, classHeaders, currentClass, reportDS} = this.props;
        var levels = reportDS.levels.toJS(), subjecLevels = reportDS.subjectLevels.toJS(), gradeName = reportDS.examInfo.toJS().gradeName, allStudentsPaperMap = this.props.reportDS.allStudentsPaperMap.toJS();
        this.levels = levels;
        var theDS = getDS(levels, subjecLevels, classHeaders, gradeName, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap);
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
        var subjectDS = getSubjectDS(currentLevelDS.bestAndWorst);

        return (
            <div id='scoreLevel' className={commonClass['section']}>
                <div>
                    <span className={commonClass['title-bar']}></span>
                    <span className={commonClass['title']}>学科分档人数分布</span>
                    <span className={commonClass['title-desc']}>运用大数据分析算法将总分到分档分数精准的分解到学科中，得出各学科的分档分数线及其分档上线人数分布，可反映出班级在学科的上线情况</span>
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
                <p style={{fontSize: 12, marginTop: 15}}><span style={{color: colorsMap.B08}}>*</span>本次班级学生总分达到{numberMap[activeTab]}档上线水平这一点上，本班{subjectDS.high}学科表现较好，{subjectDS.low}学科表现相对不足</p>
            </div>
        )
    }
}
export default SubjectLevelDisribution;

//=================================================  分界线  =================================================
//各个档次的table数据以及各个档次的文案数据
function getDS(levels, subjecLevels, classHeaders, gradeName, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap) {
    var result = {};
    _.each(levels, (levObj, levelKey) => {
        var subjectLevelMeanInfo = subjecLevels[levelKey];   //_.find(subjecLevels, (obj) => obj.levelKey == levelKey);
        if(!subjectLevelMeanInfo) return;

        var currentSubjectLevelInfo = makeCurrentSubjectLevelInfo(subjectLevelMeanInfo, levObj, currentClass, classStudents, classStudentsPaperMap, allStudentsPaperMap);
        var {validOrderedSubjectMean} = filterMakeOrderedSubjectMean(classHeaders, subjectLevelMeanInfo);
        var tableDS = getTableDS(currentSubjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass);
        var bestAndWorst = getBestAndWorst(currentSubjectLevelInfo, currentClass, subjectLevelMeanInfo);
        result[levelKey] = {tableDS: tableDS, bestAndWorst: bestAndWorst}
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

/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} classHeaders         [description]
 * @return {[type]}                 [description]
 */
function getTableDS(subjectLevelInfo, validOrderedSubjectMean, gradeName, currentClass) {
    var table = [];
    var titleHeader = _.map(validOrderedSubjectMean, (headerObj, index) => {
        return headerObj.subject + '(' + headerObj.mean + ')';
    });
    titleHeader.unshift('班级');

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return (_.isUndefined(totalSchoolObj[headerObj.id])) ? '无数据' : totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    var currentClassObj = subjectLevelInfo[currentClass];
    var currentClassRow = _.map(validOrderedSubjectMean, (headerObj) => {
        return (_.isUndefined(currentClassObj[headerObj.id])) ? '无数据' : currentClassObj[headerObj.id];
    });
    currentClassRow.unshift(gradeName + currentClass + '班');
    table.push(currentClassRow);

    table.unshift(titleHeader);

    return table;
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
function filterMakeOrderedSubjectMean(classHeaders, subjectLevelMeanInfo) {
    //按照headers的顺序，返回有序的[{subject: , id(): , mean: }]
    var valids = [], unvalids = [];
    _.each(classHeaders, (headerObj) => {
        if(headerObj.id == 'totalScore') return;
        if(subjectLevelMeanInfo[headerObj.id]) {
            valids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        } else {
            unvalids.push({id: headerObj.id, subject: headerObj.subject, mean: subjectLevelMeanInfo[headerObj.id].mean});
        }
    });
    return {validOrderedSubjectMean: valids, unvalids: unvalids};
}
