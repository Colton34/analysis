//学科考试表现
import _ from 'lodash';
import React, { PropTypes } from 'react';
import StatisticalLib from 'simple-statistics';

import TableView from '../../../../common/TableView';
import EnhanceTable from '../../../../common/EnhanceTable';

var COLUMN_NAMES = ["学科", "满分","最高分","最低分","平均分","标准差","差异系数","难度","实考人数","缺考人数"];
var INDICATORFUNS = [getSubjectName, getFullMark, getMaxScore, getMinScore, getMeanScore, getStandardDeviation, getDiscriminationFactor, getDifficulty, getRealStudentCount, getLostStudentCount];
var columnIndicatorFunMap = getIndicatorFunMap(COLUMN_NAMES, INDICATORFUNS);

export default function ExamPerformance({classStudents, classStudentsPaperMap, classHeaders, currentClass, reportDS}) {
    var examPapersInfo = reportDS.examPapersInfo.toJS(), examClassesInfo = reportDS.examClassesInfo.toJS();
    var tableHeaders = getTitleHeader(COLUMN_NAMES);
    var tableDS = getTableDS(examPapersInfo, examClassesInfo, classStudents, classHeaders, classStudentsPaperMap, currentClass);

    return (
        <div style={{marginTop: 30}}>
            <TableView tableHeaders={tableHeaders} tableData={tableDS} reserveRows={6} TableComponent={EnhanceTable}/>
        </div>
    )
}

//=================================================  分界线  =================================================
/*
计算说明：每一科目是一个object
    var obj = {};
    obj.subject = headerObj.subject;
    //计算所有指标：
    正常：obj[<指标的名字>] = <number>
    缺考人数：obj[<指标的名字>] = {value: number, overlayData: {title: '学生名单', content: <学生名单字符串>}}
 */
function getTableDS(examPapersInfo, examClassesInfo, classStudents, classHeaders, classStudentsPaperMap, currentClass) {
    var value;
    return _.map(classHeaders, (headerObj, index) => {
        var obj = {};
        var paperScores = _.map(classStudentsPaperMap[headerObj.id], (paper) => paper.score);
        _.each(columnIndicatorFunMap, (fun, key) => {
            value = fun({paperScores: paperScores, examClassesInfo: examClassesInfo, currentClass: currentClass, examPapersInfo: examPapersInfo, headerObj: headerObj});
            obj[key] = (key == '缺考人数') ? {value: value, overlayData: {title: '学生名单', content: getLostStudentNames(examClassesInfo, classStudentsPaperMap, headerObj, currentClass, classStudents)}} : value;
        });
        return obj;
    });
}

function getTitleHeader(columns) {
    var tipConfig = {
        '标准差': {content: '反映了学生分数的分布离散程度，值越大表示个体之间的分数分布的离散程度越大，反之，值越小表示个体之间的分数分布的离散程度越小；', direction: 'bottom'},
        '差异系数': {content: '标准差与平均分之比，表示不同样本的相对离散程度。值越大表示相对离散程度越大，反之，值越小表示相对离散程度越小；', direction: 'bottom'}
    };

    var tableHeaders = [[]];
    _.forEach(columns, column => {
        var obj = {};
        obj.id = column;
        obj.name = column;
        if(column === '标准差' || column === '差异系数') {
            obj.tipContent = tipConfig[column].content;
        }
        tableHeaders[0].push(obj);
    });
    return tableHeaders;
}

function getIndicatorFunMap(columnNames, indicatorFuns) {
    var result = {};
    _.each(columnNames, (coluName, index) => {
        result[coluName] = indicatorFuns[index];
    });
    return result;
}

function getSubjectName({headerObj}) {
    return headerObj.subject;//学科
}
function getFullMark({examPapersInfo, headerObj}) {
    return examPapersInfo[headerObj.id].fullMark;//满分
}
function getMaxScore({paperScores}) {
    return _.max(paperScores);//最高分
}
function getMinScore({paperScores}) {
    return _.min(paperScores);//最低分
}
function getMeanScore({paperScores}) {
    return _.round(_.mean(paperScores), 2);//平均分
}
function getStandardDeviation({paperScores}) {
    return StatisticalLib.standardDeviation(paperScores).toFixed(2);//标准差
}
function getDiscriminationFactor({paperScores}) {
    var sdevia = StatisticalLib.standardDeviation(paperScores).toFixed(2);
    var mean = _.mean(paperScores);
    return _.round(_.divide(sdevia, mean), 2);//差异系数: 标准差/平均分
}
function getDifficulty({paperScores, examPapersInfo, headerObj}) {
    var mean = _.mean(paperScores);
    return _.round(_.divide(mean, examPapersInfo[headerObj.id].fullMark), 2);//难度
}
function getRealStudentCount({examPapersInfo, headerObj, currentClass}) {
    return examPapersInfo[headerObj.id].classes[currentClass];//实考人数
}
function getLostStudentCount({examClassesInfo, currentClass, examPapersInfo, headerObj}) {
    return examClassesInfo[currentClass].students.length - examPapersInfo[headerObj.id].classes[currentClass];//缺考人数
}

//TODO: 1.classStudentsPaperMap中的obj是
/*
    class_name:"1"
    id:359553
    paperid:"90372-12"
    score:22
这样，只有id，但是examClassesInfo[currentClass].students是从grade.class.students中拿到的，只存了其xuehao(或者是考号)，所以不能匹配
其次，就算匹配了，本身也没有name信息--因为grade.class.students中没有存，而之前就是为了避免新能才没有逐个学生去获取的

 */
function getLostStudentNames(examClassesInfo, classStudentsPaperMap, headerObj, currentClass, classStudents) {
    return ''
    // debugger;
    // var realStudentIds = _.map(classStudentsPaperMap[headerObj.id], (stuObj) => {
    //     debugger;
    //     return stuObj['kaohao']
    // });
    // var allStudentIds = examClassesInfo[currentClass].students;
    // var lostStudentIds = _.difference(allStudentIds, realStudentIds);
    // var lostStudentNames = _.map(_.filter(classStudents, (stuObj) => _.includes(lostStudentIds, stuObj.id)), (sObj) => sobj.name);
    // debugger;
    // return _.join(lostStudentNames, '，'); //缺考名单
}
