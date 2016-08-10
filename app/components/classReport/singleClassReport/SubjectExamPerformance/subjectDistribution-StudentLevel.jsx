//学生学科水平分布
import _ from 'lodash';
import React, { PropTypes } from 'react';

export default function SubjectStudentLevelDistirbution({reportDS, currentClass}) {

}

//=================================================  分界线  =================================================

// export default function SubjectStudentLevelDistirbution({reportDS, currentClass}) {
//     var examStudentsInfo = reportDS.examStudentsInfo.toJS(), examPapersInfo = reportDS.examPapersInfo.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS();
//     var tableDS = getTableDS(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, currentClass);
//     debugger;
// }

function getTableDS(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, currentClass) {
//每一行需要的原数据是“当前学科” “本班学生” “成绩正序排名”
    var tableData = [];
    _.each(headers, (headerObj) => {
        if(headerObj.id == 'totalScore') return; //没有总分的数据
        var subjectStudents = allStudentsPaperMap[headerObj.id];
        var groupStudentsInfo = makeGroupStudentsInfo(subjectStudents);
        var rowData = _.map(groupStudentsInfo, (obj) => {
            var currentSubjectGroupStudentCount = (obj.classStudents[currentClass]) ? obj.classStudents[currentClass].length : 0;
            return currentSubjectGroupStudentCount;
        });
        rowData.unshift(headerObj.subject);
        tableData.push(rowData);
    });
    return tableData;
}

//除了总分外还要分不同的学科。需要所有学生各科的成绩
//拿到这个数据结构然后在从里面筛选出属于此班级的数据
function makeGroupStudentsInfo(students, groupLength=10) {
    students = _.orderBy(students, ['score'], ['desc']);//保证高分段在前
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
