import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';
//Util
import {makeFactor} from '../../../../api/exam';

export default function({subjectInfoBySchool, headers}) {
    var {tableHeaders, tableData} = getTableRenderData(subjectInfoBySchool, headers);

    return(
        <div>
             <div style={{margin: '30px 0 20px 0'}}>
                <span className={commonClass['sub-title']}>各学校的学科平均水平的贡献率</span>
                <span className={commonClass['title-desc']}>
                    各校的平均得分率看起来有高有低，与各学校各自实际客观情况有极大的关系（比如有示范校与普通校之分），不能简单通过排队来评价学校教学质量的高低，需要给予客观分析。
                    相对于各学校自身综合水平而言，存在学科表现的非均衡性。我们基于学校实际的综合水平表现来考察某学科对学校学科综合水平的贡献，并联系联考总体的对应情况进行综合分析，提炼出体现学业水平的“学科贡献率”指标。
                    一个学校的“学科贡献率”有正值或者负值。正值数值越大越好，是促进学校提高了综合水平的学科；负值的绝对值越大越不好，应是拖了后腿的学科。
                </span>
            </div>
            <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
        </div>
    )
}


function getTableRenderData(subjectInfoBySchool, headers) {
    var seqList = ['total'].concat(_.keys(_.omit(subjectInfoBySchool, 'total'))); //让总体数据放在最前; 
    var originalMatrix = makeOriginalMatirx(subjectInfoBySchool, headers, seqList);
    var factorMatrix = makeFactor(originalMatrix);
    var tableHeaders = getTableHeaders(headers);
    var tableData = getTableData(factorMatrix, seqList, headers);

    return {tableHeaders, tableData};
} 

function makeOriginalMatirx(subjectInfoBySchool, headers, seqList) {
    var matrix = [];

    _.forEach(seqList, (schoolName) => {
        var schoolInfo = subjectInfoBySchool[schoolName];
        matrix.push(_.map(headers, headerObj => {
             var subjectInfo = schoolInfo[headerObj.id];
             var meanScoreRate = subjectInfo ? _.round(subjectInfo.sum / (subjectInfo.count * subjectInfo.fullMark), 2) : '--'; //计算平均得分率
             return meanScoreRate;
         }))
    })
    return matrix;
}

function getTableHeaders(headers) {
    var tableHeaders = [[{id: 'school', name: '学校'}]];
    _.forEach(headers.slice(1), headerInfo => {
        tableHeaders[0].push({id: headerInfo.id, name: headerInfo.subject, columnStyle: getColumnStyle});
    })
    return tableHeaders;
}

function getTableData(factorMatrix, seqList, headers){
    var tableData = [];
    _.forEach(factorMatrix, (fmRowData, rIndex) => {
        var rowData = {};
        rowData.school = seqList[rIndex + 1]; //省略掉第一个“total"字段
        _.forEach(fmRowData, (data, index) => {
            rowData[headers[index + 1].id] = data; // +1是为忽略掉headers中的第一个totalScore字段
        })
        tableData.push(rowData)
    })
    return tableData;
}

function getColumnStyle(cell) {
    if (cell < 0) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}