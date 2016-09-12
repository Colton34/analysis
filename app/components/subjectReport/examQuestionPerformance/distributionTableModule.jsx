import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';
import {COLORS_MAP as colorsMap} from '../../../lib/constants';

export default function DistributionTableModule({paperQuestionsDiffInfo, paperDiff, summaryInfo}) {
    var {tableHeaders, tableData} = getTableRenderData(paperQuestionsDiffInfo);
    var conclusionSummary = getConclusionSummary(paperQuestionsDiffInfo);
    debugger;
    return (
       <div style={{marginTop: 20}}>
            <p>本学科的整体难度把握: <span style={{color: colorsMap.B03}}>{paperDiff}</span>，{summaryInfo}</p>
            <p>分别从客观题，主观题试题难度分布结构看，这次考试试题的难度分布情况见下表：</p>

            <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            <div className={commonClass['analysis-conclusion']}>
                 {conclusionSummary}试题的难度分布对学生的考试成绩分布有直接的影响，它反映了命题者的命题指导思想。对试卷总体难度的把握与设计时，一定要多从试题难度的分布结构上来思考。
            </div>
        </div>
    )
}

function getTableRenderData(paperQuestionsDiffInfo) {
    var diffInfo = getDiffInfo(paperQuestionsDiffInfo);
    var tableHeaders = [[{id: 'type', name: '题型'}, {id: 'diff', name: '难度'}]]
    _.forEach(_.range(5), num => {
        var headObj = {};
        headObj.id = num ;
        headObj.name = _.round(num * 0.2, 2) + '-' + _.round((num + 1) * 0.2, 2);
        tableHeaders[0].push(headObj);
    })

    var tableData = [];
    // 主客观题数据行填充
    var typeName = {obj: '客观题', sub: '主观题'};
    _.forEach(['obj', 'sub'], type => {
        _.forEach(_.range(2), num => {
            let rowData = {};
            if (num === 0) {
                rowData.type = {value: typeName[type]};
                rowData.type.rowSpan = 2;

                rowData.diff = '题号';
                _.forEach(diffInfo[type], (questionList, groupNum) => {
                    var questionNameList = questionList.map(questionInfo => {return questionInfo.name});
                    rowData[groupNum] = questionNameList.length ? _.join(questionNameList, ',') : '--';
                })
            } else {
                rowData.diff = '合计赋分';
                _.forEach(diffInfo[type], (questionList, groupNum) => {
                    var questionSum = _.sum(questionList.map(questionInfo => {return questionInfo.score}));
                    rowData[groupNum] = questionSum !== 0 ? questionSum : '--';
                })
            }
            tableData.push(rowData);
        })
    })
    // 赋值总分
    let rowData = {type: {value: '赋分合计', colSpan: 2}};
    _.forEach(_.range(5), num => {
        var sum = 0;
        _.forEach(['obj', 'sub'], type => {
            sum += _.sum(diffInfo[type][num].map(questionInfo => {return questionInfo.score}))
        })
        rowData[num] = sum;
    })
    tableData.push(rowData);
    return {tableHeaders, tableData};
}

//根据难度确定在第几组
function getGroupNum(diff) {
    if (diff === 1) {
        return 4;
    } else {
        return parseInt(diff * 10 / 2);
    }

}

function getDiffInfo(paperQuestionsDiffInfo) {
    var diffInfo = {obj: {}, sub: {}};
    _.forEach(_.range(5), num => {
        _.forEach(diffInfo, (obj, type) => {
            diffInfo[type][num] = [];
        })
    })
    _.forEach(paperQuestionsDiffInfo, (infoObj, index) => {
        if (infoObj.isObjective) {
            var groupNum = getGroupNum(infoObj.diff);
            if (diffInfo.obj[groupNum]) {
                diffInfo.obj[groupNum].push(infoObj);
            } else {
                diffInfo.obj[groupNum] = [infoObj];
            }
        }else{
            var groupNum = getGroupNum(infoObj.diff);
            if(diffInfo.sub[groupNum]){
                diffInfo.sub[groupNum].push(infoObj);
            } else {
                diffInfo.sub[groupNum] = [infoObj];
            }
        }
    })
    return diffInfo;
}

function getConclusionSummary(paperQuestionsDiffInfo){
    var groupBy = _.groupBy(paperQuestionsDiffInfo,'isObjective');
     var diffQuestion = _.filter(groupBy.true,function(obj){
        return obj.diff<=0.5;
    });
    var allQuestionDiff =  _.filter(paperQuestionsDiffInfo,function(obj){
        return obj.diff<=0.2;
    });
    debugger;
    if(diffQuestion.length>0 && allQuestionDiff.length>0){
        var summary = '从试题难度分布表中可看到，本学科试卷中 有难度特别大（难度低于0.5）的客观题，其难度设计的考虑还可以周全些。 所有试题中，难度系数在0.2以下的试题在这次考试中有设置，作为学校学业水平性的考试，这样对试题难度设计的考虑，是否一定有必要，可以进一步斟酌。';
    }else if(diffQuestion.length>0 && allQuestionDiff.length<=0){
        var summary = '从试题难度分布表中可看到，本学科试卷中 有难度特别大（难度低于0.5）的客观题，其难度设计的考虑还可以周全些。';
    }else if(diffQuestion.length<=0 && allQuestionDiff.length>0){
        var summary = '所有试题中，难度系数在0.2以下的试题在这次考试中有设置，作为学校学业水平性的考试，这样对试题难度设计的考虑，是否一定有必要，可以进一步斟酌。'
    }else if(diffQuestion.length<=0 && allQuestionDiff.length<=0){
        var summary = '';
    }
    return summary;
}
