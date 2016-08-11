//自定义成绩等级的人数比例对比
import _ from 'lodash';
import React, { PropTypes } from 'react';

import {LETTER_MAP as letterMap} from '../../../lib/constants';
import {makeSegmentsCount} from '../../../api/exam';
//这里等级参数是可变的
export default function CustomScoreLevel({reportDS}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), allStudentsPaperMap = reportDS.allStudentsPaperMap.toJS(), headers = reportDS.headers.toJS(), gradeName = reportDS.examInfo.toJS().gradeName;
    var theDS = getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName);
    debugger;
}

//=================================================  分界线  =================================================


function getDS(examPapersInfo, allStudentsPaperMap, headers, gradeName, levelPcentages=[0, 60, 70, 85, 100]) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
//segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    // levelPcentages = levelPcentages ? levelPcentages.push(1) : ;  //五个刻度，四个档次
    var result = {}, total = levelPcentages.length -1, matrix;
    var titleHeader = _.map(_.range(total), (index) => {
        return index==total-1 ?  letterMap[index] + '等（小于'+ _.round(_.divide(levelPcentages[total-index], 100), 2) +'）' : letterMap[index] + '等（'+ _.round(_.divide(levelPcentages[total-index-1], 100), 2) +'）';
    });
    titleHeader.unshift('班级');

    _.each(examPapersInfo, (paperObj, index) => {
        //每一个科目|
        matrix = [];
        matrix.push(titleHeader); //Note: 本来Header是不随着科目改变而改变的（但是有些会，比如header是班级列表的时候，因为不同的科目有可能参加的班级不同，但是这里都是统一的levelPercentages--当然是跟着this.state.levelPcentages）
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelPcentages);
        var paperStudentsGroupByClass = _.groupBy(allStudentsPaperMap[paperObj.id], 'class_name');
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

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelPcentages) {
    return _.map(levelPcentages, (levelPercentage) => _.round(_.multiply(_.divide(levelPercentage, 100), paperFullMark), 2));
}
