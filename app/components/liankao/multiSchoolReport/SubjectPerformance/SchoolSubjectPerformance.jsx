// 联考报告-学科基本表现-各学校平均水平；
import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

/**
 * props:
 * subjectInfoBySchool: 父组件数据预处理后的数据结构，详见父组件说明；
 * headers: 来自reportDS;
 */
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
                    rowData[headerId] = subjectInfo ? _.round(subjectInfo.sum / (subjectInfo.count * subjectInfo.fullMark), 5) : 0;
                }
            }) 
        })
        tableData.push(rowData);
    })
    return tableData;
}
/**
 * 当单元格的值小于联考全体的值时标红；
 * @params: cell: 单元格数据; rowData: 当前行数据; rowIndex: 行序号； columnIndex: 列序号；id: 当前数据所属的id值； tableData: 传入表格组件的整个tableData数据；
 * @return: inline style对象；
 */
function getColumnStyle(cell, rowData, rowIndex, columnIndex, id, tableData) {
    if (rowData.school === '联考全体') return {};
    if (cell < tableData[0][id]) {
        return {color: colorsMap.B08};
    } else {
        return {};
    }
}

/**
 * 将单元格数据按照百分比显示；
 * @param: cell: 单元格数据；rowData: 当前行数据；
 * @return：计算后的百分比数值字符串；
 */
function getDataFormat(cell, rowData) {
    return _.round(cell * 100, 2) + '%';
}