import React from 'react';
import _ from 'lodash';
// style
import commonClass from '../../../../styles/common.css';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
// components
import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

export default function({reportDS}) {
    var headers = reportDS.headers.toJS(), examStudentsInfo = reportDS.examStudentsInfo.toJS(), examInfo = reportDS.examInfo.toJS();
    var {tableHeaders, tableData} = getTableRenderData(examStudentsInfo, headers, examInfo);
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
function getTableRenderData(examStudentsInfo, headers, examInfo) {  
    var subjectInfoBySchool = getSubjectInfoBySchool(examStudentsInfo, headers, examInfo);
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
                    rowData[headerId] = subjectInfo ? _.round(subjectInfo.sum / (subjectInfo.count * subjectInfo.fullMark), 2) : 0;
                }
            }) 
        })
        tableData.push(rowData);
    })
    return tableData;
}
function getPaperidInfoMap(headers, examInfo) {
    var mapper = {};
    _.forEach(headers, headerInfo => {
        mapper[headerInfo.id] = headerInfo;
    })
    mapper.totalScore.fullMark = examInfo.fullMark; //需要用到所有学科的总分信息；
    return mapper;
}

/**
 * todo: 注释
 */
function getSubjectInfoBySchool(examStudentsInfo, headers, examInfo) {
    var data = {};
    var paperidInfoMap = getPaperidInfoMap(headers, examInfo);

    _.forEach(examStudentsInfo, studentInfo => {
        // 将“总分”信息记录在总体信息内
        if(!data.total) {
            data.total = {totalScore: {count: 0, sum: 0, fullMark: examInfo.fullMark}};
        }
        data.total.totalScore.count += 1;
        data.total.totalScore.sum += studentInfo.score;
        // 将总分信息记录在相应学校内
        if (!data[studentInfo.school]) {
            data[studentInfo.school] = {totalScore: {count: 0, sum: 0, fullMark: examInfo.fullMark}};
        }
        data[studentInfo.school].totalScore.count += 1;
        data[studentInfo.school].totalScore.sum += studentInfo.score;

        //遍历各个学科
        _.forEach(studentInfo.papers, paperInfo => {
            // 记录到联考总体信息   
            var {paperid} = paperInfo;
            if (!data.total[paperid]) {
                data.total[paperid] = {count: 0, sum: 0, fullMark: paperidInfoMap[paperid].fullMark}
            }
            data.total[paperid].count += 1;
            data.total[paperid].sum += paperInfo.score;
            // 记录到相关学校信息
            if (!data[studentInfo.school][paperid]) {
                data[studentInfo.school][paperid] = {count: 0, sum: 0, fullMark: paperidInfoMap[paperid].fullMark};
            }
            data[studentInfo.school][paperid].count += 1;
            data[studentInfo.school][paperid].sum += paperInfo.score;
        })
    })

    return data;
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
    return cell + '%';
}