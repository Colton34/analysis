//学科成绩等级的人数分布比例
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../../common/EnhanceTable';
import TableView from '../../../../common/TableView';

import {makeSegmentsCount} from '../../../../api/exam';
import {LETTER_MAP as letterMap} from '../../../../lib/constants';

import commonClass from '../../../../common/common.css';

export default function SubjectScoreLevelDistribution({reportDS, currentClass, classStudentsPaperMap}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), headers = reportDS.headers.toJS();
    var tableDS = getTableDS(examPapersInfo, classStudentsPaperMap, headers, currentClass);

    return (
        <div>
            <div style={{marginTop: 30}}>
                <span className={commonClass['sub-title']}>学科成绩等级的人数分布比例</span>
                <span className={commonClass['title-desc']}>本次考试，将班级整体及各学科成绩，分为A,B,C,D等多个等级，来观察不同成绩等级下的学生人数分布。</span>
            </div>
            <div style={{marginTop: 30}}>
                <TableView tableHeaders={tableDS.tableHeaders} tableData={tableDS.tableData} TableComponent={EnhanceTable} tableSortable/>
            </div>
        </div>
    )
}


//=================================================  分界线  =================================================
function getTableDS(examPapersInfo, classStudentsPaperMap, headers, currentClass, levelPcentages=[0, 60, 70, 85, 100]) {//Note: 这个等级是固定不变的
    var total = levelPcentages.length -1;
    var tableHeaders = [[{id: 'subject', name: '学科成绩分类', rowSpan: 2}], []];
    _.forEach(_.range(total), index => {
        var header = {};
        if (index === 0) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'以上）';
        } else if (index === total-1) {
            header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index], 100), 2) +'以下）';
        } else {
            header.name = header.name = letterMap[index] + '等（得分率' + _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'-' + _.round(_.divide(levelPcentages[total-index], 100), 2) + '）';
        }
        header.colSpan = 2;
        tableHeaders[0].push(header);
    })
    var subHeads = [{id: 'count', name: '人数'}, {id: 'percentage', name: '占比'}];
    _.forEach(tableHeaders[0].slice(1), (header, index) => {
        var cloneSubHead = _.cloneDeep(subHeads);
        _.forEach(cloneSubHead, subHead => {
            if (subHead.id === 'percentage') {
                subHead.dataFormat = percentageTableFormat;
            }
            subHead.id = subHead.id + '_' + index;

            tableHeaders[1].push(subHead);
        })
    })

    var tableData = [];
    var subjectHeaders = headers.slice(1);//没有总分这一行
    _.forEach(subjectHeaders, (headerObj, index) => {
        var rowData = {};
        rowData.subject = headerObj.subject;

        var paperObj = examPapersInfo[headerObj.id];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        var result = makeSegmentsCount(classStudentsPaperMap[headerObj.id], segments); //注意：低等次在前
        _.reverse(result);//高等次在前
        _.forEach(result, (count, index) => {
            rowData['count_' + index] = count;
        })
        result = _.map(result, (count) => {
            var percentage = (classStudentsPaperMap[headerObj.id]) ? _.round(_.multiply(_.divide(count, classStudentsPaperMap[headerObj.id].length), 100), 2) : 0;
            return percentage;
        });
        _.forEach(result, (percentage, index) => {
            rowData['percentage_' + index] = percentage;
        })
        tableData.push(rowData);
    })
    return {tableHeaders, tableData};

}
function percentageTableFormat(cellData) {
    return cellData + '%';
}
function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}
