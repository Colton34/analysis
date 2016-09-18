import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

export default function({subjectInfoBySchool, headers}) {
    var {tableHeaders, tableData} = getTableRenderData(subjectInfoBySchool, headers);
    return(
        <div>
            <div style={{margin: '30px 0 20px 0'}}>
                <span className={commonClass['sub-title']}>各学校平均水平</span>
                <span className={commonClass['title-desc']}>从平均水平看，联考全体和学校的各学科平均得分率见下表所示</span>
            </div>
            <TableView hover tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
        </div>
    )
}
/**
 * 
 * return {tableHeaders, tableData}
 */
function getTableRenderData(subjectInfoBySchool, headers) {  
    var tableHeaders = getTableHeaders(headers);
    var tableData = getTableData(subjectInfoBySchool, headers);
    return {tableHeaders, tableData};
}

function getTableHeaders(headers) {
    var tableHeaders = [[{id: 'school', name: '学校', rowSpan: 2}], []];
    _.forEach(headers, headerInfo => {
        var header = {};
        header.colSpan = 2;
        header.name = headerInfo.subject;
        header.headerStyle = {textAlign: 'center'};
        tableHeaders[0].push(header);

        var secondLineHeader = {};
        _.forEach(['avg', 'avgPercentage'], (subHeaderStr, index) => {
            var subHeader = {};
            subHeader.id = subHeaderStr + '_' + headerInfo.id;
            subHeader.name = index === 0 ? '平均分' : '平均得分率';
            subHeader.columnSortable = true;
            subHeader.columnStyle = getColumnStyle;
            if (index === 1) {
                subHeader.dataFormat = getDataFormat;
            }
            tableHeaders[1].push(subHeader);
        })
    })
    return tableHeaders;
}

function getTableData(subjectInfoBySchool, headers) {
    var tableData = [];
    _.forEach(subjectInfoBySchool, (schoolInfo, schoolName) => {
        var rowData = {};
        rowData.school = schoolName !== 'total' ? schoolName : '联考全体';
        _.forEach(headers, header => {
            _.forEach(['avg', 'avgPercentage'], (subHeaderStr, index) => {
                var headerId = subHeaderStr + '_' + header.id; 
                var subjectInfo = schoolInfo[header.id]; // 要检查该学校是否参与了某科的考试
                if (index === 0) {
                    rowData[headerId] = subjectInfo ? _.round(subjectInfo.sum / subjectInfo.count, 2) : 0; 
                } else {
                    rowData[headerId] = subjectInfo ? _.round(subjectInfo.sum / (subjectInfo.count * subjectInfo.fullMark), 4) : 0;
                }
            }) 
        })
        tableData.push(rowData);
    })
    return tableData;
}

function getColumnStyle(cell, rowData, rowIndex, columnIndex, id, tableData) {
    if (rowData.school === '联考全体') return {};
    if (cell < tableData[0][id]) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}

function getDataFormat(cell, rowData) {
    return _.round(cell * 100, 2) + '%';
}