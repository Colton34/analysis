import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../common/common.css';
import TableView from '../../../common/TableView';
import {makeSegmentsDistribution} from '../../../sdk';
import {LETTER_MAP as letterMap} from '../../../lib/constants';

export default function ClassSubjectLevel({currentSubject, reportDS}) {
    var paperFullMark = reportDS.examPapersInfo.toJS()[currentSubject.pid].fullMark;
    var currentPaperStudentsInfo = reportDS.allStudentsPaperMap.toJS()[currentSubject.pid];
    var tableData = getTableDS(paperFullMark, currentPaperStudentsInfo);
    return (
        <div>
            <div style={{margin: '30px 0'}}>
                <span className={commonClass['sub-title']}>班级学科成绩的等级结构比例</span>
                <span className={commonClass['title-desc']}>将语文学科分为ABCD四个档次，了解各个班级关于本学科的ABCD档人数占比表现的情况</span>
            </div>
            <TableView tableData={tableData}/>
        </div>
    )
}


function getTableDS(paperFullMark, currentPaperStudentsInfo, levelPcentages=[0, 0.6, 0.7, 0.85, 1]) {
    var tableDS = [], total = levelPcentages.length -1;
    var titleHeader = ['班级'];
    _.forEach(_.range(total), index => {
        if (index === 0) {
            titleHeader.push(letterMap[index] + '等（得分率' + levelPcentages[total-index-1] +'以上）');
        } else if (index === total-1) {
            titleHeader.push(letterMap[index] + '等（得分率' + levelPcentages[total-index] +'以下）');
        } else {
            titleHeader.push(letterMap[index] + '等（得分率' + levelPcentages[total-index-1] +'-' + levelPcentages[total-index] + '）');
        }
    });
    tableDS.push(titleHeader);

    var segments = _.map(levelPcentages, (p) => _.round(_.multiply(p, paperFullMark), 2));
    var classPaperStudentsGroup = _.groupBy(currentPaperStudentsInfo, 'class_name');
    _.map(classPaperStudentsGroup, (classStudents, classKey) => {
        var classSegmentsDis = makeSegmentsDistribution(segments, classStudents, 'score');
        var classSegmentsDisCounts = _.reverse(_.map(classSegmentsDis, (obj) => obj.count));
        classSegmentsDisCounts.unshift(classKey + '班');
        tableDS.push(classSegmentsDisCounts);
    });
    return tableDS;
}

