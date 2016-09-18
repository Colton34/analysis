// 联考报告-各学科成绩的等级结构比例
import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../../styles/common.css';
import {COLORS_MAP as colorsMap, LETTER_MAP as letterMap} from '../../../../../lib/constants';
// components
import TableView from '../../../../../common/TableView';
import EnhanceTable from '../../../../../common/EnhanceTable';
//utils
import {makeSegmentsCount} from '../../../../../api/exam';

/**
 * props:
 * reportDS:
 */
export default function({levelPercentages, reportDS}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), headers = reportDS.headers.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
    var {tableHeaders, tableData} = getTableRenderData(levelPercentages, headers, allStudentsPaperMap);
    return (
        <div>
            <div style={{margin: '30px 0 20px 0'}}>
                <span className={commonClass['sub-title']}>各学科成绩的等级结构比例</span>
                <span className={commonClass['title-desc']}></span>
            </div>
            <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
        </div>
    )
}


function getTableRenderData(levelPercentages, headers, allStudentsPaperMap) {
    var tableHeaders = getTableHeaders(levelPercentages);
    var tableData = getTableData(headers, allStudentsPaperMap, levelPercentages);
    return {tableHeaders, tableData};
}   

function getTableHeaders(levelPercentages) {
    var tableHeaders = [[{id: 'subject', name: '学科'}]];
    var total = levelPercentages.length -1;
     _.forEach(_.range(total), index => {
        var header = {};
        if (index === 0) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'以上）';
        } else if (index === total-1) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index], 100), 2) +'以下）';
        } else {
            header.name = header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPercentages[total-index-1], 100), 2) +'-' + _.round(_.divide(levelPercentages[total-index], 100), 2) + '）';
        }
        header.id = letterMap[index];
        header.dataFormat = getTableDataFormat;
        tableHeaders[0].push(header);
    })
    return tableHeaders;
}

function getTableData(headers, allStudentsPaperMap, levelPercentages) {
    var tableData = [];
    _.forEach(headers.slice(1), headerInfo => {
        var rowData = {};
        rowData.subject = headerInfo.subject;
        var segments = makeSubjectLevelSegments(headerInfo.fullMark, levelPercentages);
        var result = makeSegmentsCount(allStudentsPaperMap[headerInfo.id], segments);
        _.reverse(result);//使高档次在前
        _.forEach(result, (count, index) => {
            rowData[letterMap[index]] = _.round(count / allStudentsPaperMap[headerInfo.id].length, 5);
        })
        tableData.push(rowData);
    })
    return tableData;
}
// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPercentages) {
    return _.map(levelPercentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}

function getTableDataFormat(cell) {
    return _.round(cell * 100, 2) + '%';
}