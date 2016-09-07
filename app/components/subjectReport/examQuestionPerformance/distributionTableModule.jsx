import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import EnhanceTable from '../../../common/EnhanceTable';


export default function DistributionTableModule({paperQuestionsDiffInfo}) {
    var {tableHeaders, tableData} = getTableRenderData(paperQuestionsDiffInfo);
    return (
       <div>
            <p>本学科的整体难度把握: <span style={{color: 'red'}}>数据待填充</span></p>
            <p>分布从客观题，主观题试题难度分布结构看，这次考试试题的难度分布情况见下表。</p>

            <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            <div className={commonClass['analysis-conclusion']}>
                <div style={{color: 'red'}}>结论部分，待填充</div>
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
