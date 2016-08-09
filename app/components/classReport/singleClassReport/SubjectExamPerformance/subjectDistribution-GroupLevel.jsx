//学科成绩等级的人数分布比例

import React, { PropTypes } from 'react';

export default function SubjectScoreLevelDistribution() {

}


//=================================================  分界线  =================================================


function theSubjectLevelExamTable(examPapersInfo, allStudentsPaperMap, headers, levelPcentages, currentClass) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var matrix = [], total = levelPcentages.length -1;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('学科成绩分类');
    matrix.push(titleHeader);

    var subjectHeaders = headers.slice(1);//没有总分这一行

    _.each(subjectHeaders, (headerObj, index) => {
        //每一个科目|
        var paperObj = examPapersInfo[headerObj.id];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        //这应该是当前科目的区分段的count--而不是总分（且一定不包含总分）
        //获取此科目下当前班级学生（不再是所有学生）的成绩
        var currentClassSubjectStudents = _.filter(allStudentsPaperMap[headerObj.id], (obj) => obj.class == currentClass);
        var result = makeSegmentsCount(currentClassSubjectStudents, segments); //注意：低等次在前
        result = _.reverse(result);//高等次在前
        //不需要再计算百分比了
        // result = _.map(_.reverse(result), (count) => {
        //     var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
        //     return percentage + '%';
        // });
        result.unshift(paperObj.subject);
        matrix.push(result);
    });

    return matrix;
}
