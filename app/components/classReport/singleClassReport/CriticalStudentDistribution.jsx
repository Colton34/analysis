//临界生群体分析
import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';
import EnhanceTable from '../../../common/EnhanceTable';

import {NUMBER_MAP as numberMap, COLORS_MAP as colorsMap} from '../../../lib/constants';
import {makeSegmentsCountInfo} from '../../../api/exam';

import commonClass from '../../../common/common.css';
import singleClassReportStyle from './singleClassReport.css';

var COLOR_CONSTANT = ['#0099ff', '#33cc33', '#33cccc'];

export default  function CriticalStudent({classStudents, reportDS}) {
    var examInfo = reportDS.examInfo.toJS(), levels = reportDS.levels.toJS(), subjectLevels = reportDS.subjectLevels.toJS(), levelBuffers = reportDS.levelBuffers.toJS();

    var {xAxis, criticalStudentInfo} = getDS(classStudents, examInfo, levels, levelBuffers);
    var tableDS = getTableDS(xAxis, criticalStudentInfo, levels, subjectLevels);
    var summaryInfo = getSummaryInfo(tableDS);
    var tableRenderData = getTableRenderData(tableDS);

    return (
         <div id='criticalStudent' className={commonClass['section']}>
            <span className={commonClass['title-bar']}></span>
            <span className={commonClass['title']}>临界生群体分析</span>
            <span className={commonClass['title-desc']}>临界生是指总分数在各分数档线附近的学生群体。掌握他们的学科表现，分析他们的薄弱学科并帮助突破，对稳定他们的上线可能性有很大的帮助。</span>
            <p style={{fontSize:'14px',color:'#6a6a6a',paddingTop:20}}>下表是本次考试各档临界生人数情况以及临界生群体的总分及学科平均分的表现，这部分学生应给予更多的关注，对提高本班的上线率有显著的积极作用。红色数据表示低于学科分档线</p>
            {
                tableRenderData.map((renderData, index) => {
                    return <EnhanceTable key={index} tableHeaders={renderData.tableHeaders} tableData={renderData.tableData} style={{marginTop: 20}}/>
                })
            }
          <div className={singleClassReportStyle['analysis-conclusion']}>
                <div style={{lineHeight: '1.5'}}>分析诊断：</div>
                {
                    summaryInfo.map((info, index) => {
                        return (
                            <div key={index} style={{lineHeight: '1.5'}}>
                                对于班级的{numberMap[index + 1]}档临界生群体，
                                {info.better ? <span>表现好的学科是<span style={{color: colorsMap.B03, margin: '0 5px'}}>{info.better}</span>，表现不好的学科是<span style={{color: colorsMap.B03, margin: '0 5px'}}>{info.worse}</span>。</span> : info}
                            </div>
                        )
                    })
                }
          </div>
        </div>
    )
}

//=================================================  分界线  =================================================

function getDS(classStudents, examInfo, levels, levelBuffers) {
    var xAxis = makeChartXAxis(levels);
    var criticalStudentInfo = makeCriticalStudentsInfo(classStudents, examInfo, levels, levelBuffers);
    return {
        xAxis: xAxis,
        criticalStudentInfo: criticalStudentInfo
    }
}

function getChartDS(criticalStudentInfo) {
    if(_.size(criticalStudentInfo) > 5) return;
    var series = [], temp = [];
    var data = _.map(criticalStudentInfo, (studentArr, index) => {
        var studentList = _.join(_.map(studentArr, (stuObj) => stuObj.name), '，');
        return {
            studentList: studentList,
            y: studentArr.length,
            color: COLOR_CONSTANT[index]
        }
    });
    temp.data = data;
    series.push(temp);
    return series;
}

function getLevelBufferInfo(levelBuffers, levels) {
    var levelLastIndex = _.size(levels) - 1;
    var tempArr = _.map(levels, (levObj, levelKey) => {
        return numberMap[levelKey-0+1]+'档'+levelBuffers[levelLastIndex-levelKey]+'分';
    });
    return _.join(tempArr, '、');
}

function makeChartXAxis(levels) {
    return _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index+1] + '档临界生人数';
    });
}

function makeCriticalStudentsInfo(classStudents, examInfo, levels, levelBuffers) {
    var criticalLevelInfo = {};
    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });
    var segments = makeCriticalSegments(levelBuffers, levels);
    var classCountsInfoArr = makeSegmentsCountInfo(classStudents, segments);
    var classRow = _.filter(classCountsInfoArr, (countInfo, index) => (index % 2 == 0));//从低到高
    classRow = _.reverse(classRow); //从高到底

    _.each(classRow, (arr, index) => {
        criticalLevelInfo[index] = arr;//这里是反转后的数据。
    });

    return criticalLevelInfo;
}

function makeCriticalSegments(levelBuffers, levels) {
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score-levelBuffers[levelKey-0]);
        result.push(levObj.score+levelBuffers[levelKey-0]);
    });
    return result;
}

/*
每一档：
{
    levelTitle: <String>
    studentNames: ['xxx', 'xxx', ...],
    criticalMeans: [xx, xx, ..]
    levelScores: [xx, xxx, ...]
    subjectNames: [xx, xx, xx...]
}
*/
function getTableDS(xAxis, criticalStudentInfo, levels, subjectLevels) {
    //criticalStudentsInfo和xAxis是反转后的数据，subjectLevels和levels没有反转
    var levelLastIndex = _.size(criticalStudentInfo) - 1;
    return _.map(xAxis, (levelName, index) => {
        var obj = {};
        obj.levelTitle = levelName;
        var criticalStudents = criticalStudentInfo[index];
        obj.studentNames = _.map(criticalStudents, (obj) => obj.name);
        var criticalTotalScoreMean = (criticalStudents.length == 0) ? 0 : _.round(_.mean(_.map(criticalStudents, (obj) => obj.score)), 2);
        var criticalMeans = [];
        criticalMeans.push(criticalTotalScoreMean);
        var subjectLevelInfo = subjectLevels[levelLastIndex - index];
        var subjectNames = _.map(subjectLevelInfo, (subjectInfoObj, paperId) => subjectInfoObj.name);
        subjectNames.unshift('总分');
        obj.subjectNames = subjectNames;
        var criticalSubjectMeans = getCriticalSubjectMeans(criticalStudents, subjectLevelInfo);
        criticalMeans = _.concat(criticalMeans, criticalSubjectMeans);
        var levelScores = [];
        levelScores.push(levels[levelLastIndex - index].score);
        levelScores = _.concat(levelScores, _.map(subjectLevelInfo, (subjectInfoObj, paperId) => subjectInfoObj.mean));
        obj.criticalMeans = criticalMeans;
        obj.levelScores = levelScores;
        return obj;
    })
}

function getCriticalSubjectMeans(criticalStudents, subjectLevelInfo) {
    if(criticalStudents.length == 0) return _.map(subjectLevelInfo, (subjectInfoObj, paperId) => 0);
    return _.map(subjectLevelInfo, (subjectInfoObj, paperId) => {
        var criticalSubjectScores = _.map(criticalStudents, (stuObj) => {
            var targetPaper = _.find(stuObj.papers, (obj) => obj.paperid == paperId);
            return targetPaper.score;
        });
        return _.round(_.mean(criticalSubjectScores), 2);
    });
}

function getSummaryInfo(tableDS) {
//每一档次：
//  obj.criticalMeans, levelScores, subjectNames -- 去掉'总分' -- 如果只有一个学科则显示没有可以比性--返回一个String，而不是一个obj {better: , worse: }
    return _.map(tableDS, (obj, index) => {
        //如果有两个以上的科目则返回obj={better: , worse: }，否则只有一个科目则返回String:没有可比性
        var subjectNames = _.slice(obj.subjectNames, 1);
        if (subjectNames.length <= 1) return '只有一个学科没有可比性。';

        var criticalMeans = _.slice(obj.criticalMeans, 1),
            levelScores = _.slice(obj.levelScores, 1);

        var temp = _.map(subjectNames, (sname, index) => {
            return {
                diff: _.subtract(criticalMeans[index], levelScores[index]),
                subject: sname
            }
        });
        temp = _.sortBy(temp, 'diff');
        return {
            better: _.last(temp).subject,
            worse: _.first(temp).subject
        }
    });
}

function getTableRenderData(tableDS) {
    var tableRenderData = [];
    _.forEach(tableDS, (levelObj, index) => {
        var renderData = {};
        var tableHeaders = [[{ id: 'levelTitle', name: levelObj.levelTitle, dataFormat: getLevelTitleFormat }, { id: 'contrastItem', name: '对比项' }]];
        _.forEach(levelObj.subjectNames, (subjectName, index) => {
            var header = {};
            header.id = index;
            header.name = subjectName;
            tableHeaders[0].push(header);
            header.columnStyle = getColumnStyle;
        })

        var tableData = [];
        //两行数据
        _.range(2).map(num => {
            var rowData = {};
            _.forEach(tableHeaders[0], header => {
                if (header.id === 'levelTitle' && num === 0) {
                    rowData.levelTitle = {};
                    var ele = rowData.levelTitle;
                    ele.value = levelObj.studentNames.length;
                    ele.rowSpan = 2;
                    ele.overlayData = {};
                    ele.overlayData.title = '学生名单';
                    ele.overlayData.content = levelObj.studentNames.length ? _.join(levelObj.studentNames, '，'): '无';
                    return;
                }
                if (header.id === 'contrastItem') {
                    if (num === 0) {
                        rowData.contrastItem = '临界生平均分';
                    } else {
                        rowData.contrastItem = '学科分档线';
                    }
                    return;
                }
                switch (num) {
                    case 0:
                        rowData[header.id] = levelObj.criticalMeans[header.id];
                        break;
                    case 1:
                        rowData[header.id] = levelObj.levelScores[header.id];
                        break;
                }
            })
            tableData.push(rowData);
        })
        tableRenderData.push({tableHeaders, tableData});
    })
    return tableRenderData;
}

function getColumnStyle(cellData, rowData, rowIndex, columnIndex, id, tableData) {
    //只针对第一行
    if (rowIndex > 0) return {};
    if(tableData[1][id] > cellData) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}

function getLevelTitleFormat(cellData) {
    return cellData.value + '人';
}


