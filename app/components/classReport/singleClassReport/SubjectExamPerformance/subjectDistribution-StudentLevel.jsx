//学生学科水平分布
import _ from 'lodash';
import React, { PropTypes } from 'react';

import EnhanceTable from '../../../../common/EnhanceTable';
import TableView from '../../../../common/TableView';

import commonClass from '../../../../common/common.css';
import {NUMBER_MAP as numberMap} from '../../../../lib/constants';
import {COLORS_MAP as colorsMap} from '../../../../lib/constants';
import singleClassReportStyle from '../singleClassReport.css';
export default function SubjectStudentLevelDistirbution({classHeaders, reportDS, classStudents, currentClass}) {

    var examStudentsInfo = reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS();
    var tableDS = getTableDS(examStudentsInfo, examPapersInfo, allStudentsPaperMap, classHeaders, currentClass);

    var tableHeaders = [[{id: 'subject', name: '学科'}]];
    var headers = _.range(10).map(num=> {
        return {id: num, name: '第' + numberMap[num+1] + '组人数'};
    });
    tableHeaders[0] = tableHeaders[0].concat(headers);

    var tableData = _.map(tableDS, (rowData, index) => {
        var obj = {};
        obj.subject = rowData[0];
        _.each(_.range(10), num=> {
            obj[num] = {};
            obj[num]['value'] = rowData[num+1].length;
            obj[num]['overlayData'] = {};
            obj[num]['overlayData'].title = '学生名单';
            obj[num]['overlayData'].content = getStudentNames(rowData[num+1], classStudents);
        })
        return obj;
    });

var good='语文';var bad='数学';//假数据，最好和最坏学科
    return (
        <div>
            <div style={{marginBottom: 30,marginTop:30}}>
                <span className={commonClass['sub-title']}>学生学科水平分布</span>
                <span className={commonClass['title-desc']}>按成绩高低将学生等分为10组（第1组成绩最高，第10组成绩最低）。高分段学生密度越大，表现有优势，低分段学生密度越大，则需要在教学中注意帮助这部分学生突破。</span>
            </div>
            <TableView tableHeaders={tableHeaders} tableData={tableData} TableComponent={EnhanceTable}/>
            <div className={singleClassReportStyle['analysis-conclusion']}>
                  <div>分析诊断：</div>
                  <div>根据上图各学科高分段（一，二，三组）学生人数和低分段（八，九，十）学生人数大小可知，<span style={{color:colorsMap.B03}}>{good}</span>学科高分段人数较多，<span style={{color:colorsMap.B03}}>{bad}</span>学科低分段人数较少</div>
            </div>

        </div>
    )
}

//=================================================  分界线  =================================================
function getTableDS(examStudentsInfo, examPapersInfo, allStudentsPaperMap, classHeaders, currentClass) {
//每一行需要的原数据是“当前学科” “本班学生” “成绩正序排名”
    var tableData = [];
    _.each(classHeaders, (headerObj) => {
        // if(headerObj.id == 'totalScore') return; //没有总分的数据
        var subjectStudents = allStudentsPaperMap[headerObj.id];
        var groupStudentsInfo = makeGroupStudentsInfo(subjectStudents);
        var rowData = _.map(groupStudentsInfo, (obj) => {
            var currentSubjectGroupStudentCount = (obj.classStudents[currentClass]) ? obj.classStudents[currentClass] : [];
            return currentSubjectGroupStudentCount;
        });
        rowData.unshift(headerObj.subject);
        tableData.push(rowData);
    });
    return tableData;
}

//除了总分外还要分不同的学科。需要所有学生各科的成绩
//拿到这个数据结构然后在从里面筛选出属于此班级的数据
//区分总分“人群”和单科“人群”
function makeGroupStudentsInfo(students, groupLength=10) {
    students = _.reverse(students);//保证高分段在前
    var result = {}, flagCount = students.length, totalStudentCount = students.length;
    _.each(_.range(groupLength), function(index) {
        var groupCount = (index == groupLength-1) ? flagCount : (_.ceil(_.divide(totalStudentCount, groupLength)));
        //当前组的学生数组：
        var currentGroupStudents = _.slice(students, (flagCount - groupCount), flagCount);
        //对当前组的学生按照班级进行group
        var groupStudentsGroupByClass = _.groupBy(currentGroupStudents, 'class_name');
        flagCount -= groupCount;
        result[index] = { groupCount: groupCount, classStudents: groupStudentsGroupByClass, flagCount: flagCount };
    });
    return result;
}

function getStudentNames(students, classStudents) {
    var studentIds = _.map(students, (sObj) => sObj.id);
    return _.join(_.map(_.filter(classStudents, (sObj) => _.includes(studentIds, sObj.id)), (stuObj) => stuObj.name), '，');
}
