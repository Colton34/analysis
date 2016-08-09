//自定义成绩等级的人数比例对比

import React, { PropTypes } from 'react';

export default function CustomScoreLevel() {

}

//=================================================  分界线  =================================================


function theSubjectLevelExamTable(examPapersInfo, allStudentsPaperMap, headers, currentClass, gradeName, levelPcentages=[0, 60, 70, 85, 100]) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var result = {}, total = levelPcentages.length -1;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('班级');
    matrix.push(titleHeader);

    _.each(examPapersInfo, (paperObj, index) => {
        //每一个科目|
        var matrix = [];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[paperObj.id], 'class');
        //这应该是当前科目的区分段的count--而不是总分（且一定不包含总分）
        //获取此科目下当前班级学生（不再是所有学生）的成绩
        _.each(paperStudentsGroupByClass, (studentsArr, className) => {
            var temp = makeSegmentsCount(studentsArr, segments);
            temp = _.map(_.reverse(temp), (count) => {
                var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
                return percentage + '%';
            });
            temp.unshift(gradeName+className+'班');
            matrix.push(temp);
        });

        result[paperObj.id] = matrix;
    });

    return matrix;
}
