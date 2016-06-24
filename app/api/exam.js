/*
* @Author: HellMagic
* @Date:   2016-05-18 18:57:37
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-23 21:24:10
*/

//说明：paperId === _id，即是ObjectId  pid === id 即是StringId。如果有paper那么id就是StringId，如果没有那么id是ObjectId。pid应该一定是指StringId
/*
数据结构实例：
examInfo:
{
    name:
    gradeName:
    startTime:
    realClasses:
    lostClasses:
    realStudentsCount:
    lostStudentsCount:
    subjects:
    fullMark:

}

examStudentsInfo
[
    {
        id:
        name:
        class:
        score:
        papers: [
            {paperid: , score: }
        ]
    },
    ...
]

examPapersInfo
{
    <pid>: {
        id:
        paper:
        subject:
        fullMark:
        realClasses:
        lostClasses:
        realStudentsCount:
        lostStudentsCount:
        class: {
            <className>: <此科目此班级参加考试的人数>
        }
    },
    ...
}

examClassesInfo : 班级的整个exam的参加考试人数没有太大的意义（特别是对于统计计算，因为肯定是走哪个科目的这个班级的参加考试人数--这个在papersInfo的class中有）
{
    <className>: {
        name:
        students:
        realStudentsCount:
        losstStudentsCount:
    }
}

headers:
[{id: 'totalScore', subject: '总分'}, {id: , subject:'语文' , index: }, ...]

levels:
{
    '0': {
        score: 0,
        count: 0,
        percentage: 15  //确认这里60%是“累计占比”--即一档+二挡+三挡总共60%
    },
    '1': {
        score: 0,
        count: 0,
        percentage: 25
    },
    '2': {
        score: 0,
        count: 0,
        percentage: 60
    }
}

 */

/*
Note:
    segments和区间段的表示法描述：
    segments: [<start>, <stepTwo>, <stepThree>, ... , <end> ]                   length=n   (注意，segments中都是从小到大顺序的排列，但是有些显示的时候
                                                                            需要从大到小显示，那样需要显示的地方自己reverse，比如档次从高档到低档显示)
    区间段：由segments依次相邻的两个刻度形成。[<start>, <stepTwo>], (<stepTwo, stepThree>], (], ... (<>, <end>]      (n-1)个
    如果sements设置的最小（大）值不是所有查询值中的最小（大）值，那么给出的index就会有-1（或者当超过最大值的时候是 (segments.length-1)）出现，但是从设计上考虑不应
    该出现这两个值。剩下的0~segments.length-2 这共segments.length-1个值分别对应segments.length-1个区段
 */

'use strict';

import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
require('moment/locale/zh-cn'); //这是moment.local()方法的bug：http://momentjs.com/docs/#/use-it/browserify/
var errors = require('common-errors');

import {
    SUBJECTS_WEIGHT as subjectWeight,
    NUMBER_MAP as numberMap,
    LETTER_MAP as letterMap
} from '../lib/constants';

var examPath = "/exam";

var paperPath = '/papers';


export function fetchPaper(params) {
    var url = (params.isFromCustom) ? paperPath + '/' + params.pid + '/exam/' + params.examId : paperPath + '/' + params.pid;
    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}


//********************************************************* Home *********************************************************
/**
 * 从服务端获取格式化好的视图数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function fetchHomeData(params) {
    var url = examPath + '/home';

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    })
}

//********************************************************* Dashboard *********************************************************
export function fetchDashboardData(params) {
    var url = (params.grade) ? examPath + '/dashboard?examid=' + params.examid + '&grade=' + encodeURI(params.grade) : examPath + '/custom/dashboard?examid=' + params.examid;

    return params.request.get(url).then(function(res) {
        // console.log('=======================  dashboard res.data.keys = ', _.keys(res.data));
        //TODO: 需要赋值给reducer，然后直接展现就好；肯能还有一两个漏掉的~~~
        return Promise.resolve(res.data);
    });
}

//********************************************************* SchoolAnalysis *********************************************************


export function fetchSchoolAnalysisData(params) {
    var url = (params.grade) ? examPath + '/school/analysis?examid=' + params.examid + '&grade=' + encodeURI(params.grade) : examPath + '/custom/school/analysis?examid=' + params.examid;

    var examInfo, examStudentsInfo, examPapersInfo, examClassesInfo;
    var studentsGroupByClass, allStudentsPaperMap;
    var headers = [];
    var levels;

    return params.request.get(url).then(function(res) {
        var examInfo = res.data.examInfo;
        var examStudentsInfo = res.data.examStudentsInfo;
        var examPapersInfo = res.data.examPapersInfo;
        var examClassesInfo = res.data.examClassesInfo;
        var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class');
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperid');
        var headers = [], restPapers = [];
        _.each(examPapersInfo, (paper, pid) => {
            var index = _.findIndex(subjectWeight, (s) => (s == paper.subject));
            if (index >= 0) {
                headers.push({
                    index: index,
                    subject: paper.subject,
                    id: pid
                });
            } else {
                restPapers.push(paper);
            }
        });
        headers = _.sortBy(headers, 'index');
        headers.unshift({
            subject: '总分',
            id: 'totalScore'
        });
        headers = _.concat(headers, _.map(restPapers, (paper) => paper.subject));
        var levels = makeDefaultLevles(examInfo, examStudentsInfo);
        var levelBuffers = _.map(levels, (value, key) => 5);

        return Promise.resolve({
            haveInit: true,
            examInfo: examInfo,
            examStudentsInfo: examStudentsInfo,
            examPapersInfo: examPapersInfo,
            examClassesInfo: examClassesInfo,
            studentsGroupByClass: studentsGroupByClass,
            allStudentsPaperMap: allStudentsPaperMap,
            headers: headers,
            levels: levels,
            levelBuffers: levelBuffers
        });
    });
}

//=================================  Test Code =================================================
// var result = theTotalScoreTrenderChart(examInfo, examStudentsInfo); //Done

//每一行都是全levelKey(已经自动填充好了)  并且levelKey的顺序同levels中的顺序  并且levelKey所对应的count就是segments区间对应的count
// var totalScoreLevelInfo = makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels);


// var tableData = theTotalScoreLevelTable(totalScoreLevelInfo, levels); //Done
//需要高档在前的话就自己在展示遍历的时候反转
// var disData = theTotalScoreLevelDiscription(totalScoreLevelInfo, levels); //Done
// var chartData = theTotalScoreLevelChart(totalScoreLevelInfo, theKey)


// var subjectHeader = theSubjectLevelTotalHeader(levels);
// var {subjectLevelInfo, subjectsMean} = makeSubjectLevelInfo(levels[0].score, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, examPapersInfo, examInfo.fullMark); //Done
// // var tableData = theSubjectLevelTable(subjectLevelInfo, subjectsMean, examInfo, headers); //Done
// var chartData = theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers); //Done
// var disData = theSubjectLevelDiscription(chartData.xAxons, chartData.yAxons, headers);  //Done

// var chartData = theClassExamChart(examInfo, examStudentsInfo, examClassesInfo, headers); //Done
// var subjectMeanInfo = makeClassExamMeanInfo(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo, studentsGroupByClass, headers);
// var examMeanTableData = theClassExamMeanTable(examInfo, subjectMeanInfo, headers);
// var examFactorTableData = theClassExamMeanFactorsTable(examInfo, subjectMeanInfo, studentsGroupByClass, headers); //Done
// var classExamGroupTableData = theClassExamTotalScoreGroupTable(examInfo, examStudentsInfo); //Done

// var subjectExamTableData = theSubjectExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers); //Done
// var subjectLevelExamTableData = theSubjectLevelExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers);

// var {tableData, criticalLevelInfo} = criticalStudentsTable(examInfo, examStudentsInfo, studentsGroupByClass, levels);
// var disData = criticalStudentsDiscription(criticalLevelInfo); //Done

// var {topTableData, lowTableData} = theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers);

// debugger;

//================================================================================================


//======================================== 总分分布趋势 =========================================
//内容：一个图表；一个分析说明
/**
 * 总分分布趋势的图表
 * @param  {[type]} examInfo         [description]
 * @param  {[type]} examStudentsInfo [description]
 * @return {[type]}                  [description]
 */
function theTotalScoreTrenderChart(examInfo, examStudentsInfo) {
    var segments = makeSegments(examInfo.fullMark);
    var xAxons = _.slice(segments, 1); //Note：因为不显示0刻度，并且最后一个是fullMark刻度
    var yAxons = makeSegmentsStudentsCount(examStudentsInfo, segments);

    return {
        'x-axon': xAxons,
        'y-axon': yAxons
    }
}

//TODO: 根据图形是“单峰”还是“双峰”去显示对应的说明文案
/*
总分分布趋势的说明
 */
function theTotalScoreTrenderDiscription() {

}

//======================================== 总分分档上线学生分布 =========================================
//内容:一个Header头说明；一个表格；一个分析说明；一个图表（搭配一个选择框来显示不同组类型学生的分布，全部学生或某班级学生）
//TODO：注意“点击查看更多班级数据是由判断条件来决定是否有这个东西的”
//下拉框的内容，比如班级，来自于examInfo.realClasses

function theTotalScoreLevelHeader(levels) {
    //直接从 levels 中获取

}

//算法：按照分档标准创建对应的segments。segments最小值是最低档线，最大值是满分（即，一档线区间是(一档线score, fullMark]）
/**
 * 用来画Table的info数据结构
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     table的matrix。这里是夹心header，所以不提供header，从levels中获取行排列（夹心栏就按照图表给的顺序：['人数',
 *   '累计人数', '累计占比']）
 */
function theTotalScoreLevelTable(totalScoreLevelInfo, levels) {
    var table = [];
    var totalSchoolObj = totalScoreLevelInfo.totalSchool;

    //全校信息总是table的第一行
    var totalSchoolRow = makeLevelTableRow(totalSchoolObj);
    // debugger;
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    _.each(totalScoreLevelInfo, (levInfoItem, theKey) => {
        if (theKey == 'totalSchool') return;
        var totalClassRow = makeLevelTableRow(levInfoItem);
        totalClassRow.unshift(theKey + '班');
        table.push(totalClassRow);
    });

    return table;
}

function makeLevelTableRow(rowInfo) {
    //rowInfo每一个levelKey都有对应的对象，而且顺序是对应levels的（即和segments是一样的，都是从低到高，而显示的时候是从高到底，所以这里需要反转）
    // debugger;
    var tempMap = _.map(rowInfo, (rowObj, levelKey) => [rowObj.count, rowObj.sumCount, rowObj.sumPercentage + '%']);
    // debugger;
    // vat tempMap = _.map(rowInfo, (rowObj, levelKey) => [rowObj.count, rowObj.sumCount, rowObj.sumPercentage + '%']);
    return _.concat(..._.reverse(tempMap));
}


/**
 * 由档次的维度来找出此档次上线率高和低的班级，取多少位的排名取决于总共有多少个班级
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     [description]
 */
/*
首先要去掉totalSchool
{
    <className>: {
        <levelKey>: {
            count:
            sumCount:
            sumPercentage:
        }
    }
}

==>
[
    {levelKey: , class: , sumPercentage: }
]
==>
对上面的数组按照levelKey进行groupBy
{
    <levelKey>: [<obj>]
}

按照规则得到结果
 */
/**
 * 总分分档上线学生模块的分析描述文案
 * @param  {[type]} totalScoreLevelInfo [description]
 * @return {[type]}                     [description]
 * {
 *     <levelKey>: {
 *         low: [<className>]
 *         high: [<className>]
 *     }
 * }
 */
function theTotalScoreLevelDiscription(totalScoreLevelInfo, levels) {
    //找出各个档次各个班级的累积上线率，并按照levelKey进行分组
    var totalScoreLevelInfoGroupByLevel = _.groupBy(_.concat(..._.map(totalScoreLevelInfo, (theObj, theKey) => {
        if (theKey == 'totalSchool') return [];
        return _.map(theObj, (levObj, levelKey) => {
            return {
                levelKey: levelKey,
                sumPercentage: levObj.sumPercentage,
                'class': theKey
            }
        })
    })), 'levelKey');

    var levelClassCount = _.size(totalScoreLevelInfo) - 1;
    //根据规则得到每个档次高低的班级名称：这里是和levels中的顺序是一一对应的，即'0'是一档。。。
    var result = {},
        low, high;
    _.each(levels, (levObj, levelKey) => {
        var orderLevelTotalScore = _.sortBy(totalScoreLevelInfoGroupByLevel[levelKey], 'sumPercentage'); //从低到高
        if (orderLevelTotalScore.length == 0) return;

        if (levelClassCount == 2 || levelClassCount == 3) {
            low = _.map(_.take(orderLevelTotalScore, 1), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 1), (item) => item.class);
        } else if (levelClassCount >= 4 && levelClassCount < 7) {
            low = _.map(_.take(orderLevelTotalScore, 2), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 2), (item) => item.class);
        } else if (levelClassCount >= 7) {
            low = _.map(_.take(orderLevelTotalScore, 3), (item) => item.class);
            high = _.map(_.takeRight(orderLevelTotalScore, 3), (item) => item.class);
        }
        result[levelKey] = {
            low: low,
            high: high
        }
    });
    return result;
}


function theTotalScoreLevelChart(levelTotalScoreInfo, theKey) {
    // 通过 levelTotalScoreInfo[theKey] 即可获得此scope下所有学生的分档情况
}

function chageStudentsScope(theKey) {
    //改变观察的学生范围
}

/**
 * 获取总分分档的info数据结构（info数据结构是一种具有典型格式的数据结构： {totalSchool: {...}, <className>: {...} } ）每一个key中的value对象中的key就是横向扫描
 * 的属性，个数和顺序都一样！！！这里totalSchool和<className>其实就是列的key，所以info是一个二重的Map，按照需要的matrixTable创建，横向扫描，一重key是列的key，二
 * 重key是行的key。列key没有顺序，行key有顺序。（比如如果是分档，则高档在前，依次排列，如果是科目，则语数外在前，按照subjectWeight排列）
 * @param  {[type]} examInfo             [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} examClassesInfo      [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} levels               [description]
 * @return 这里横向轴是分档所以对象就是分档信息
 *     {
 *         totalSchool: {
 *
 *         },
 *         <className>: {
 *
 *         }
 * }
 */
function makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels) {
    //因为levels中是高档次（即score值大的）在前面，所以需要反转顺序
    var levelSegments = _.map(levels, (levObj) => levObj.score);
    //用来获取全校各档次的人数  -- segments的最后一个肯定是fullMark，而第一个是最低档的分数
    levelSegments.push(examInfo.fullMark);

    var result = {};

    //获取到分档Map并且过滤到-1的情况（因为最小值是最低分档线，而又学生的成绩会低于最低分档线）
    //{<levelKey>: <students>} 其中levelKey是String类型的，并且值小代表的是低分段（但是levels中）
    //从makeSegmentsStudentsCount得到的 countsMap中的 levelKey的个数一定是 segments.length-1 个，所以省去了后面判断没有某一个levelKey对应的数据则要补充。

    //makeSegmentsStudentsCount 获取的是：1.和segments顺序对应的key的count，也就是说低的levelKey对应的是低分段的count  2.包含[0, segments.length-2]共
    //segments.length-1个有效值

    var countsGroupByLevel = makeSegmentsStudentsCount(examStudentsInfo, levelSegments);

    //开始创建标准的resultInfo数据结构：
    result.totalSchool = {};

    _.each(countsGroupByLevel, (count, levelKey) => {
        result.totalSchool[levelKey] = makeLevelInfoItem(levelKey, countsGroupByLevel, examInfo.realStudentsCount);
    });

    _.each(studentsGroupByClass, (studentsFromClass, className) => {
        var classCountsGroupByLevel = makeSegmentsStudentsCount(studentsFromClass, levelSegments);
        var temp = {};
        _.each(classCountsGroupByLevel, (count, levelKey) => {
            temp[levelKey] = makeLevelInfoItem(levelKey, classCountsGroupByLevel, examClassesInfo[className].realStudentsCount);
        });
        result[className] = temp;
    });

    return result;
}

function makeLevelInfoItem(levelKey, countsGroupByLevel, baseCount) {
    var levItem = {};

    levItem.count = countsGroupByLevel[levelKey];
    //各档的累计人数等于=上一个高档次的累计人数+当前档次的人数（最高档的累计人数和人数是相等的）
    levItem.sumCount = _.sum(_.map(_.pickBy(countsGroupByLevel, (v, k) => k >= levelKey), (count) => count));
    levItem.sumPercentage = _.round(_.multiply(_.divide(levItem.sumCount, baseCount), 100), 2);

    return levItem;
}

/**
 * 通过dialog修改levels
 * @param  {[type]} examInfo         [description]
 * @param  {[type]} examStudentsInfo [description]
 * @return {[type]}                  [description]
 */
function changeLevels(examInfo, examStudentsInfo) {
    //满分：
}



//=================================== 学科分档上线学生分布 ============================================
//内容：一个header描述；_.size(levels)个视图单元
//每个单元的内容：一个当前档次各科上线表格；一个分析说明，一个离差图；一段写死的文案

function theSubjectLevelTotalHeader(levels) {

}

/**
 * 学科分档的表格
 * @param  {[type]} subjectLevelInfo [description]
 * @param  {[type]} subjectsMean    [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function theSubjectLevelTable(subjectLevelInfo, subjectsMean, examInfo, headers) {
    //此档的内容
    // debugger;
    var table = [];
    var titleHeader = _.map(headers, (headerObj, index) => {
        return headerObj.subject + ' (' + subjectsMean[headerObj.id].mean + ')';
    });
    titleHeader.unshift('班级');

    var totalSchoolObj = subjectLevelInfo.totalSchool;
    var totalSchoolRow = _.map(headers, (headerObj) => {
        return totalSchoolObj[headerObj.id];
    });
    totalSchoolRow.unshift('全校');
    table.push(totalSchoolRow);

    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        if (theKey == 'totalSchool') return;
        var classRow = _.map(headers, (headerObj) => {
            return subjectLevelObj[headerObj.id];
        });
        classRow.unshift(examInfo.gradeName + theKey + '班');
        table.push(classRow);
    });

    return table;
}


function theSubjectLevelDiscription(subjectLevelInfo, examPapersInfo, headers) {
    var result = {};

    var subjectLevelArr, maxSubjects, minSubjects;
    _.each(subjectLevelInfo, (subjectLevelObj, theKey) => {
        subjectLevelArr = _.sortBy(_.filter(_.map(subjectLevelObj, (count, key) => {
            return {
                count: count,
                key: key
            };
        }), (obj) => obj.key != 'totalScore'), 'count');

        maxSubjects = _.map(_.takeRight(subjectLevelArr, 2), (obj) => examPapersInfo[obj.key].subject);
        minSubjects = _.map(_.take(subjectLevelArr, 2), (obj) => examPapersInfo[obj.key].subject);
        result[theKey] = {
            maxSubjects: maxSubjects,
            minSubjects: minSubjects
        };
    });

    return result;
}

//建立离差图形的数据结构
/*
{
    "totalSchool": {
        totalSchool:
        <pid1>:
        <pid2>:
        ...
    },
    'A1': {
        totalSchool:
        <pid1>:
        <pid2>:
        ...
    },
    ...
}

由 pid 组成的 header

 */
function theSubjectLevelChart(subjectLevelInfo, examInfo, examPapersInfo, examClassesInfo, studentsGroupByClass, headers) {
    //TODO:可能需要把计算出的最大和最小作为数据结构，因为分析说明其实就是这个图表的文字版说明

    //去掉总分的信息，因为最后的factors中是没有总分这一项的
    var titleHeader = _.map(headers.slice(1), (obj) => obj.subject);

    //构造基本的原matrix
    var originalMatrix = makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, headers);

    // debugger;

    //factorsMatrix中每一行（即一重数组的长度应该和titleHeader相同，且位置意义对应）
    var factorsMatrix = makeFactor(originalMatrix);

    //扫描每一行，得到最大和最小的坐标，然后到titHeader中获取科目名称，返回{subject: , count: } 班级的顺序就是studentsGroupByClass的顺序
    var xAxons = _.map(_.keys(studentsGroupByClass), (className) => (examInfo.gradeName + className + '班'));
    var yAxons = _.map(factorsMatrix, (factorsInfo) => {
        var fmax = _.max(factorsInfo),
            fmin = _.min(factorsInfo);

        var fmaxIndex = _.findIndex(factorsInfo, (item) => item == fmax);
        var fminIndex = _.findIndex(factorsInfo, (item) => item == fmin);

        var fmaxSubject = titleHeader[fminIndex],
            fminSubject = titleHeader[fminIndex];

        return [{
            subject: fmaxSubject,
            count: fmax,
            nice: true
        }, {
            subject: fminSubject,
            count: fmin,
            nice: false
        }];
    });

    return {
        xAxons: xAxons,
        yAxons: yAxons
    }

}


//TODO: 这个计算的可能有问题--可能不需要这么复杂，这里只是对tableData进行横向扫表而不是charData的横向扫描。而且这里缺少全校的数据，但是离差中肯定是没有全校的数据的
function theSubjectLevelDiscription2(classes, subjectsInfo, headers) {
    //TODO: PM--还有必要么？显示的话，不是分组，而是逐个班级显示，贡献率最大和最小
    //TODO: 其实还是chart图的数据结构，只不过一个用图表示，一个用文字说明
    //全部打散，然后根据 科目分组，分辨出是大还是小
    var allClassSubjectsInfo = _.concat(..._.map(subjectsInfo, (subjectInfoArr, index) => _.map(subjectInfoArr, (subjectInfoObj) => _.assign(subjectInfoObj, {
        class: classes[index]
    }))));
    //按照headers的顺序显示， 如果没有则跳过
    var allClassSubjectsInfoGroupBySubject = _.groupBy(allClassSubjectsInfo, 'subject');
    var result = {};
    _.each(headers, (headerObj, index) => {
        var target = allClassSubjectsInfoGroupBySubject[headerObj.subject];
        if (!target) return;
        var nices = _.map(_.filter(target, (item) => item.nice), (obj) => obj.class);
        var bads = _.map(_.filter(target, (item) => !item.nice), (obj) => obj.class);
        result[headerObj.subject] = {
            nices: nices,
            bads: bads
        };
    });
    return result;
}

function makeSubjectLevelOriginalMatirx(subjectLevelInfo, examClassesInfo, examInfo, headers) {
    var matrix = []; //一维是“班级”--横着来
    //把全校的数据放到第一位
    var totalScoreObj = subjectLevelInfo.totalSchool;
    // debugger;
    matrix.push(_.map(headers, (headerObj) => _.round(_.divide(totalScoreObj[headerObj.id], examInfo.realStudentsCount), 2)));

    _.each(subjectLevelInfo, (subjectsOrTotalScoreObj, theKey) => {
        // var baseCount = (theKey == 'totalSchool') ? examInfo.realStudentsCount : examClassesInfo[theKey].realStudentsCount;
        if (theKey == 'totalSchool') return;
        // debugger;
        matrix.push(_.map(headers, (headerObj) => _.round(_.divide(subjectsOrTotalScoreObj[headerObj.id], examClassesInfo[theKey].realStudentsCount), 2)));
        // _.map(subjectsOrTotalScoreObj, (count, countKey) => _.round(_.divide(count, baseCount), 2))
        // //有可能某个班级没有考某个科目
        // var classCounts = [];
        // _.each(headers, (headerObj) => {
        //     classCounts.push(subjectsOrTotalScoreObj[headerObj.id]);
        // })
    });
    return matrix;
}

/**
 * 创建学科分析需要的info数据结构
 * @param  {[type]} levelScore           [description]
 * @param  {[type]} examStudentsInfo     [description]
 * @param  {[type]} studentsGroupByClass [description]
 * @param  {[type]} allStudentsPaperMap  [description]
 * @param  {[type]} examPapersInfo       [description]
 * @param  {[type]} examFullMark         [description]
 * @return {[type]}                      info格式的学科分析的数据结构
 * {
 *     totalSchool: {
 *         totalScore: <count>
 *         <pid>: <count>
 *
 *     },
 *     <className>: {
 *         totalScore: <count>
 *         <pid>: <count>
 *     },
 *     ...
 * }
 */
function makeSubjectLevelInfo(levelScore, examStudentsInfo, studentsGroupByClass, allStudentsPaperMap, examPapersInfo, examFullMark) {
    var subjectsMean = makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark);
    var schoolTotalScoreMean = _.round(_.mean(_.map(examStudentsInfo, (student) => student.score)), 2);
    subjectsMean.totalScore = {
        id: 'totalScore',
        mean: schoolTotalScoreMean,
        name: '总分'
    };
    // debugger;

    var result = {};
    result.totalSchool = {};

    result.totalSchool.totalScore = _.filter(examStudentsInfo, (student) => student.score > schoolTotalScoreMean).length;

    _.each(subjectsMean, (subMean, pid) => {
        // debugger;
        if (pid == 'totalScore') return;
        result.totalSchool[pid] = _.filter(allStudentsPaperMap[pid], (paper) => paper.score >= subMean.mean).length;
    });
    // debugger;

    _.each(studentsGroupByClass, (classStudents, className) => {
        var temp = {};
        var classTotalScoreMean = _.round(_.mean(_.map(classStudents, (student) => student.score)), 2);
        temp.totalScore = _.filter(classStudents, (student) => student.score > classTotalScoreMean).length;

        _.each(_.groupBy(_.concat(..._.map(classStudents, (student) => student.papers)), 'paperid'), (papers, pid) => {
            // debugger;
            temp[pid] = _.filter(papers, (paper) => paper.score >= subjectsMean[pid].mean).length;
        });

        result[className] = temp;
    });
    return {
        subjectLevelInfo: result,
        subjectsMean: subjectsMean
    }
}

//计算每一档次各科的平均分
//算法：获取所有考生基数中 总分**等于**此档分数线 的所有考生；如果这些考生的人数不足够样本数（当前是固定值25），则扩展1分（单位），再获取，注意：
//  1.分数都四舍五入（包括分档线）
//  2.一定要滑动窗口两边的数量是相同的，保证平均分不变（注意有“选择的某个分数上没有对应学生的情况”）
//  3.当遇到从n中取m（其中n > m）
//  一定要保证每次取的人都是相同的（根据examStudentsInfo的顺序），这样每次计算的科目平局分才是相同的
//  ，不断重复上述过程，直到满足样本数量
function makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark) {
    var result = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(levelScore));
    var count = result.length;

    var currentLowScore, currentHighScore;
    currentLowScore = currentHighScore = _.round(levelScore);
    while ((count < 25) && (currentLowScore >= 0) && (currentHighScore <= examFullMark)) {
        var currentLowStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentLowScore - 1));

        var currentHighStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentLowScore + 1));

        var currentTargetCount = _.min([currentLowStudents.length, currentHighStudents.length]);


        var currentTagretLowStudents = _.take(currentLowStudents, currentTargetCount);
        var currentTargetHighStudents = _.take(currentHighStudents, currentTargetCount);

        count += _.multiply(2, currentTargetCount);

        result = _.concat(result, currentTagretLowStudents, currentTargetHighStudents);
    }

    //result即是最后获取到的满足分析条件的样本，根据此样本可以获取各个科目的平均分信息
    return makeSubjectMean(result, examPapersInfo);
}


/**
 * 返回所给学生各科成绩的平均分。注意这里没有没有包括总分(totalScore)的平均分信息
 * @param  {[type]} students       [description]
 * @param  {[type]} examPapersInfo [description]
 * @return {[type]}                [description]
 */
function makeSubjectMean(students, examPapersInfo) {
    var result = {};
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};

        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.name = examPapersInfo[pid].subject; //TODO: 这里还是统一称作 'subject' 比较好
        obj.id = pid;

        result[pid] = obj;
    });
    return result;
}


//==================================== 班级的考试基本表现 ====================================
//内容：一个header说明；一个图表；平均得分的表格；平均得分离差的表格；总分分组的表格；
function theClassExamHeader(levels) {
    //TODO: PM--没看懂，“较多”？“较少”？
}

//一个班级或两个班级的图表
function theClassExamChart(examInfo, examStudentsInfo, examClassesInfo, headers, currentClasses) {
    var classKeys = _.keys(examClassesInfo);

    if (!currentClasses || currentClasses.length == 0) currentClasses = _.map(_.range(2), (index) => examClassesInfo[classKeys[index]]); //初始化的时候显示默认的2个班级
    var examStudentsGroupByClass = _.groupBy(examStudentsInfo, 'class');
    var result = {};

    var segments = makeSegments(examInfo.fullMark);
    var xAxons = _.slice(segments, 1);

    _.each(currentClasses, (classItem) => {
        var students = examStudentsGroupByClass[classItem.name];
        result[classItem.name] = makeSegmentsStudentsCount(students, segments);
    });

    //TODO: yAxons
    return result;
}

function theClassExamMeanTable(examInfo, subjectMeanInfo, headers) {
    //TODO: 注意原型图中少画了总分这一项（有很多地方都是），而这里添加了关于总分的数据（还是第一列，跟着headers走）
    var matrix = [];

    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;
    var totalSchoolRow = _.concat(..._.map(headers, (headerObj) => [totalSchoolMeanObj[headerObj.id].mean, totalSchoolMeanObj[headerObj.id].meanRate]));
    totalSchoolRow.unshift('全校');
    matrix.push(totalSchoolRow);

    _.each(subjectMeanInfo, (subjectMeanObj, theKey) => {
        if (theKey == 'totalSchool') return;

        var classMeanObj = subjectMeanInfo[theKey];
        var classRow = _.concat(..._.map(headers, (headerObj) => [classMeanObj[headerObj.id].mean, classMeanObj[headerObj.id].meanRate]));
        classRow.unshift(examInfo.gradeName + theKey + '班');
        matrix.push(classRow);
    });
    return matrix;
}

/**
 * //是平均得分率的小数表示的matrix
 * @param  {[type]} subjectMeanInfo [description]
 * @param  {[type]} headers         [description]
 * @return {[type]}                 [description]
 */
function theClassExamMeanFactorsTable(examInfo, subjectMeanInfo, studentsGroupByClass, headers) {
    //注意：原型图中是画错的，取离差后肯定就没有totalScore（总分）这一列了，因为在第二步的时候消除了
    var titleHeader = _.map(headers.slice(1), (obj) => obj.subject);
    titleHeader.unshift('班级');

    var originalMatrix = makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers);
    var factorsMatrix = makeFactor(originalMatrix);

    var classKeys = _.keys(studentsGroupByClass);
    _.each(factorsMatrix, (factorsInfoRow, index) => {
        factorsInfoRow.unshift(examInfo.gradeName + classKeys[index] + '班');
    });

    factorsMatrix.unshift(titleHeader);

    return factorsMatrix;
}

function makeClassExamMeanOriginalMatirx(subjectMeanInfo, headers) {
    var matrix = [];
    var totalSchoolMeanObj = subjectMeanInfo.totalSchool;

    matrix.push(_.map(headers, (headerObj) => totalSchoolMeanObj[headerObj.id].meanRate));

    _.each(subjectMeanInfo, (subjectMenaObj, theKey) => {
        if (theKey == 'totalSchool') return;
        matrix.push(_.map(headers, (headerObj) => subjectMenaObj[headerObj.id].meanRate));
    });
    return matrix;
}

//按照分组得到的总分区间段查看学生人数
/*
    {
        <组id>: {
            groupCount:
            groupStudentsGroupByClass:{
                <className>: <students>
            }
        },
        ...
    }

    将上述的Map打散，为了符合横向扫描的方式
    [
        {class: , groupKey: students: },

    ]
*/
function theClassExamTotalScoreGroupTable(examInfo, examStudentsInfo, groupLength) {
    groupLength = groupLength || 10;
    var groupStudentsInfo = makeGroupStudentsInfo(groupLength, examStudentsInfo);

    var groupHeaders = _.map(_.range(groupLength), (index) => {
        return {
            index: index,
            title: '第' + numberMap[index + 1] + '组<br />(前)' + (index + 1) + '0%)',
            id: index
        }
    });
    var titleHeader = _.concat(['班级'], _.map(groupHeaders, (headerObj, index) => headerObj.title));

    var table = [],
        totalSchoolInfo = [];

    table.push(titleHeader);

    var allGroupStudentInfoArr = []; //因为后面维度不一样了，所以这里需要打散收集信息然后再group
    _.each(groupStudentsInfo, (groupObj, groupKey) => {
        totalSchoolInfo.push(groupObj.groupCount);
        _.each(groupObj.classStudents, (students, className) => {
            allGroupStudentInfoArr.push({
                'class': className,
                groupKey: groupKey,
                students: students
            });
        });
    });


    totalSchoolInfo.unshift('全校');
    table.push(totalSchoolInfo);

    var groupStudentInfoByClass = _.groupBy(allGroupStudentInfoArr, 'class');

    _.each(groupStudentInfoByClass, (groupStudentsObjArr, className) => {
        //一行
        var classGroupCountRow = _.map(_.range(groupLength), (index) => {
            //本来可以直接对groupKey进行排序，但是这样不会知道具体是哪个组的值缺少了，所以还是需要对应key去确定
            var target = _.find(groupStudentsObjArr, (sobj) => sobj.groupKey == index);
            return target ? target.students.length : 0;
        });
        classGroupCountRow.unshift(examInfo.gradeName + className + '班');
        table.push(classGroupCountRow);
    });

    return table;
}

function makeClassExamMeanInfo(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo, studentsGroupByClass, headers) {
    var result = {};
    result.totalSchool = makeOriginalSubjectInfoRow(examStudentsInfo, examPapersInfo, examInfo, examClassesInfo);
    _.each(studentsGroupByClass, (students, className) => {
        result[className] = makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo, examClassesInfo);
    });
    return result;
}

//一行的得分率！！！
function makeOriginalSubjectInfoRow(students, examPapersInfo, examInfo, examClassesInfo) {
    var result = {};
    result.totalScore = {};

    result.totalScore.mean = _.round(_.mean(_.map(students, (student) => student.score)), 2);
    result.totalScore.count = _.filter(students, (student) => student.score >= result.totalScore.mean).length;
    result.totalScore.meanRate = _.round(_.divide(result.totalScore.mean, examInfo.fullMark), 2); //注意这里没有使用百分制

    result.totalScore.countPercentage = _.round(_.multiply(_.divide(result.totalScore.count, students.length), 100), 2); //注意这里使用了百分制
    _.each(_.groupBy(_.concat(..._.map(students, (student) => student.papers)), 'paperid'), (papers, pid) => {
        var obj = {};

        obj.mean = _.round(_.mean(_.map(papers, (paper) => paper.score)), 2);
        obj.count = _.filter(papers, (paper) => paper.score >= obj.mean).length;
        obj.meanRate = _.round(_.divide(obj.mean, examPapersInfo[pid].fullMark), 2); //注意这里没有使用百分制
        obj.countPercentage = _.round(_.multiply(_.divide(obj.count, students.length), 100), 2); //注意这里使用了百分制

        result[pid] = obj;
    });
    return result;
}


//groupLength来源于dialog的设置
function makeGroupStudentsInfo(groupLength, students) {
    //需要原始的“根据考生总分排序好的” studentsInfo 数组
    //将数组内的元素分成10组，计算每一组中各个班级学生人数
    var result = {},
        flagCount = 0,
        totalStudentCount = students.length;
    _.each(_.range(groupLength), function(index) {
        var groupCount = (index == groupLength - 1) ? (totalStudentCount - flagCount) : (_.ceil(_.divide(totalStudentCount, groupLength)));
        flagCount += groupCount;

        //当前组的学生数组：
        var currentGroupStudents = _.slice(students, (flagCount - groupCount), flagCount);
        //对当前组的学生按照班级进行group
        var groupStudentsGroupByClass = _.groupBy(currentGroupStudents, 'class');

        result[index] = {
            groupCount: groupCount,
            classStudents: groupStudentsGroupByClass,
            flagCount: flagCount
        };
    });
    return result;
}


//================================== 学科考试表现 ================================
//内容：固定文案的header；一个学科表现的表格；固定文案的说明；不同等级的各科分析的表格；关于分析的一个说明
function theSubjectExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers) {
    var table = [];

    var titleHeader = ['学科', '满分', '最高分', '最低分', '平均分', '标准差', '差异系数', '难度', '实考人数', '缺考人数'];

    table.push(titleHeader);

    var subjectHeaders = headers.slice(1); //去掉排在第一位的id: totalSchool，这样剩下的就都是科目了

    _.each(subjectHeaders, (headerObj, index) => {
        //有多少个科目就有多少行
        var subjectRow = [];
        subjectRow.push(headerObj.subject); //学科
        subjectRow.push(examPapersInfo[headerObj.id].fullMark); //满分
        var paperScores = _.map(allStudentsPaperMap[headerObj.id], (paper) => paper.score);
        subjectRow.push(_.max(paperScores)); //最高分
        subjectRow.push(_.min(paperScores)); //最低分
        var mean = _.round(_.mean(paperScores), 2);
        subjectRow.push(mean); //平均分
        var sqrt = _.round(Math.sqrt(_.divide((_.sum(_.map(paperScores, (paperScoreItem) => Math.pow((paperScoreItem - mean), 2)))), paperScores.length)), 2);
        subjectRow.push(sqrt); //标准差
        subjectRow.push(_.round(_.divide(sqrt, mean), 2)); //差异系数: 标准差/平均分
        subjectRow.push(_.round(_.divide(mean, examPapersInfo[headerObj.id].fullMark), 2)); //难度
        subjectRow.push(examPapersInfo[headerObj.id].realStudentsCount); //实考人数
        subjectRow.push(examPapersInfo[headerObj.id].lostStudentsCount); //缺考人数

        table.push(subjectRow);
    });

    return table;
}

function theSubjectLevelExamTable(examStudentsInfo, examPapersInfo, allStudentsPaperMap, headers, levelFactors) {
    //默认给出n个等次，然后最后添加1--代表满分，就是1档次的区间，这样才能形成对应的n个区间（则有n+1个刻度）
    //segments依然是从小到大，但这里展示的时候是从大到小（高难度档次在前）
    levelFactors = levelFactors ? levelFactors.push(1) : [0, 0.6, 0.7, 0.85, 1]; //五个刻度，四个档次

    var matrix = [],
        total = levelFactors.length - 1;
    var titleHeader = _.map(_.range(total), (index) => {
        return index == total - 1 ? letterMap[index] + '等（小于' + levelFactors[total - index] + '）' : letterMap[index] + '等（' + levelFactors[total - index - 1] + '）';
    });

    titleHeader.unshift('学科成绩分类');
    matrix.push(titleHeader);

    var subjectHeaders = headers.slice(1); //没有总分这一行

    _.each(subjectHeaders, (headerObj, index) => {
        //每一个科目|
        var paperObj = examPapersInfo[headerObj.id];
        var segments = makeSubjectLevelSegments(paperObj.fullMark, levelFactors);
        var result = makeSegmentsStudentsCount(examStudentsInfo, segments); //注意：低分档次的人数在前
        result = _.map(_.reverse(result), (count) => {
            var percentage = _.round(_.multiply(_.divide(count, paperObj.realStudentsCount), 100), 2);
            return percentage + '%';
        });
        result.unshift(paperObj.subject);
        matrix.push(result);
    });

    return matrix;
}

function theSubjectExamDiscription() {
    //TODO: PM--给出具体的规则。第三个文案可以写写其他简单的
    //第二个算法：各个学科各个班级的平均得分率，然后max-min，然后从中选出哪几个学科的差值较大或较小
    //班级考试基本表现中有关于 各个班级各个学科平均得分率的数据结构，可以拿来用！！！
}

// 各个学科的总分；然后四个档次的百分比，得出分段区间  fullMark: 100%  A: 85%  b: 70%  c: 60%  D: 0%
function makeSubjectLevelSegments(paperFullMark, levelFactors) {
    return _.map(levelFactors, (levelPercentage) => _.round(_.multiply(levelPercentage, paperFullMark), 2));
}


//============================= 临界生群体分析 =============================
//内容：固定文案；一个分析表格；一个分析说明
function criticalStudentsTable(examInfo, examStudentsInfo, studentsGroupByClass, levels, levelBuffers) {
    // levels = levels || makeDefaultLevles(examInfo, examStudentsInfo);
    levelBuffers = levelBuffers || _.map(_.range(_.size(levels)), (index) => 10);

    var table = [],
        criticalLevelInfo = {};

    _.each(_.range(_.size(levels)), (index) => {
        criticalLevelInfo[index] = [];
    });

    var titleHeader = _.map(_.range(_.size(levels)), (index) => {
        return numberMap[index + 1] + '档临界生人数';
    });
    titleHeader.unshift('分档临界生');

    table.push(titleHeader);

    var segments = makeCriticalSegments(levelBuffers, levels);

    var totalSchoolCounts = makeSegmentsStudentsCount(examStudentsInfo, segments);
    var totalSchool = _.filter(totalSchoolCounts, (count, index) => (index % 2 == 0));
    totalSchool = _.reverse(totalSchool);
    totalSchool.unshift('全校');
    table.push(totalSchool);

    _.each(studentsGroupByClass, (students, className) => {
        var classCounts = makeSegmentsStudentsCount(students, segments);
        var classRow = _.filter(classCounts, (count, index) => (index % 2 == 0)); //从低到高
        classRow = _.reverse(classRow); //从高到底

        _.each(classRow, (count, index) => {
            criticalLevelInfo[index].push({
                'class': className,
                count: count
            }); //因为这里使用的是反转后得到classRow，所以这里criticalLevelInfo中的
            //levelKey是颠倒后的，即小值代表高档
        });

        classRow.unshift(examInfo.gradeName + className + '班');
        table.push(classRow);
    });
    // debugger;

    // console.log('=============== criticalStudentsTable');
    // console.log(table);
    // console.log('=====================================');

    //     var criticalDis = criticalStudentsDiscription(criticalLevelInfo);  Done

    // console.log('=============== criticalStudentsDiscription');
    // console.log(criticalDis);
    // console.log('=====================================');

    return {
        tableData: table,
        criticalLevelInfo: criticalLevelInfo
    };
}

function makeCriticalSegments(levelBuffers, levels) {
    //[<thirdScore-thirdBuffer>, <thirdScore+thirdBuffer>, ...]
    var result = [];
    _.each(levels, (levObj, levelKey) => {
        result.push(levObj.score - levelBuffers[levelKey - 0]);
        result.push(levObj.score + levelBuffers[levelKey - 0]);
    });
    return result;
}

function criticalStudentsDiscription(criticalLevelInfo) { //Done
    //上面的 criticalLevelInfo
    // 每一档
    var result = {
        top: {},
        low: {}
    };
    _.each(criticalLevelInfo, (counts, levelKey) => {
        //多的前3 和 少的前三
        var orderedCounts = _.sortBy(counts, 'count'); // 升序
        var top = _.map(_.takeRight(orderedCounts, 3), (cobj) => cobj.class + '班');
        result.top[levelKey] = top;
        var low = _.map(_.take(orderedCounts, 3), (cobj) => cobj.class + '班');
        result.low[levelKey] = low;
    });
    return result; //小值代表高档
}

//============================= 有关学生的重要信息 =============================
//内容：前十后十的数据；某Top区间的总分分布表格；某Low区间的总分分布表格
//Top和Low的数据直接从examStudentsInfo中获取

function theStudentExamTables(examInfo, examStudentsInfo, allStudentsPaperMap, headers) {
    var result = {};
    _.each(examInfo.realClasses, (className) => {
        result[className] = {};
    });

    //总分的相关信息
    var totalScoreTopStudentsGroupByClass = _.groupBy(_.takeRight(examStudentsInfo, 30), 'class');
    var totalScoreLowStudentsGroupByClass = _.groupBy(_.take(examStudentsInfo, 30), 'class');

    _.each(totalScoreTopStudentsGroupByClass, (students, className) => {
        result[className].totalScore = {
            top: students.length
        };
    });

    _.each(totalScoreLowStudentsGroupByClass, (students, className) => {
        if (!result[className].totalScore) {
            result[className].totalScore = {
                low: students.length
            };
        } else {
            result[className].totalScore.low = students.length;
        }
    });

    _.each(allStudentsPaperMap, (papers, pid) => {
        var orderPapers = _.sortBy(papers, 'score');

        var topPapers = _.takeRight(orderPapers, 30); //这个30，不是固定的，而且如果是比例的话，要把比例换算成数值
        var lowPapers = _.take(orderPapers, 30);

        var topPapersGroupByClassName = _.groupBy(topPapers, 'class_name');
        var lowPapersGroupByClassName = _.groupBy(lowPapers, 'class_name');

        _.each(topPapersGroupByClassName, (cpapers, className) => {
            result[className][pid] = {
                top: cpapers.length
            };
        });
        _.each(lowPapersGroupByClassName, (cpapers, className) => {
            if (!result[className][pid]) {
                result[className][pid] = {
                    low: cpapers.length
                };
            } else {
                result[className][pid].low = cpapers.length;
            }
        });
    });

    /*
    {
        <className>: {
            totalScore: {
                top:
                low:
            },
            <pid>: {
                top:
                low:
            }
        }
    }
    */

    //TODO: select可以变化多种计算方式，会改变matrix table的数据
    var topMatrix = [],
        lowMatrix = [];
    _.each(result, (value, className) => {
        var tempTop = [],
            tempLow = [];
        _.each(headers, (headerObj, index) => {
            var tempTopCount = value[headerObj.id] ? (value[headerObj.id].top ? value[headerObj.id].top : 0) : 0;
            var tempLowCount = value[headerObj.id] ? (value[headerObj.id].low ? value[headerObj.id].low : 0) : 0;

            tempTop.push(tempTopCount);
            tempLow.push(tempLowCount);
        });

        tempTop.unshift(examInfo.gradeName + className + '班');
        tempLow.unshift(examInfo.gradeName + className + '班');

        topMatrix.push(tempTop);
        lowMatrix.push(tempLow);
    });

    return {
        topTableData: topMatrix,
        lowTableData: lowMatrix
    }
}


//================================== 公用的方法 ==================================
/**
 * 创建segments。这里count是区间段的个数，所以segments.length = count + 1(自动填充了最后的end值)
 * @param  {[type]} end   [description]
 * @param  {Number} start [description]
 * @param  {Number} count [description]
 * @return {[type]}       [description]
 */
export function makeSegments(end, start = 0, count = 12) {
    var step = _.ceil(_.divide(_.subtract(end, start), count));
    var result = _.range(start, end + 1, step);
    if (_.takeRight(result) < end) result.push(end);
    return result;
}

/**
 * 获取所给学生(students)在 由segments形成的总分（因为这里取得是student.score--可以扩展）区间段中 的分布（个数）
 * @param  {[type]} students [description]
 * @param  {[type]} segments [description]
 * @return 和segments形成的区间段一一对应的分布数数组
 */
export function makeSegmentsStudentsCount(students, segments) {
    var groupStudentsBySegments = _.groupBy(students, function(item) {
        return findScoreSegmentIndex(segments, item.score);
    });

    //(_.range(segments-1))来保证肯定生成与区间段数目（segments.length-1--即横轴或Table的一行）相同的个数，没有则填充0，这样才能对齐
    //这里已经将 levelKey = -1 和 levelKey = segments.length-1 给过滤掉了
    var result = _.map(_.range(segments.length - 1), function(index) {
        return (groupStudentsBySegments[index]) ? groupStudentsBySegments[index].length : 0
    });

    return result;
}


/*
Note: 注意这里有可能返回-1（比最小值还要小）和(segments.legnth-1)（比最大值还大）。[0~segment.length-2]是正确的值
 */
function findScoreSegmentIndex(segments, des) {
    var low = 0,
        high = segments.length - 1;
    while (low <= high) {
        var middle = _.ceil((low + high) / 2);
        if (des == segments[middle]) {
            return (des == segments[0]) ? middle : middle - 1;
        } else if (des < segments[middle]) {
            high = middle - 1;　　
        } else {
            low = middle + 1;
        }
    }
    return high; //取high是受segments的内容影响的
}

//设计：1.设计成数组是不是更好？但是groupBy后所有的key都是String类型的，会导致不匹配（倒是可以在那边转换成String，但是否提供了便利？）
/**
 * 默认的分档原则是3档，然后每一档有固定的上线率，从而得出此上线率对应的分档分数线。固定的三个档次的上线率分别是15%, 25%, 60%。
 * @param  {[type]} examInfo         [description]
 * @param  {[type]} examStudentsInfo [description]
 * @return {[type]}                  [description]
 */
function makeDefaultLevles(examInfo, examStudentsInfo) {
    //注意：1.levelKey是String类型的
    //2.parseInt(levelKey)值越小level越高，其对应的segments区间段越靠后（所以两者是相反的顺序）-- 废弃（调整了levels的顺序，也是小的key代表低分段）
    //3.这里是先固定好的百分比

    //一定要是从'0'开始的
    var levels = {
        '0': {
            score: 0,
            count: 0,
            percentage: 60 //确认这里60%是“累计占比”--即一档+二挡+三挡总共60%
        },
        '1': {
            score: 0,
            count: 0,
            percentage: 25
        },
        '2': {
            score: 0,
            count: 0,
            percentage: 15
        }
    };

    var totalStudentCount = examInfo.realStudentsCount;
    _.each(levels, (levObj, levelKey) => {
        levObj.count = _.ceil(_.multiply(_.divide(levObj.percentage, 100), totalStudentCount));
        var student = _.takeRight(examStudentsInfo, levObj.count)[0];
        levObj.score = student.score;
    });
    return levels;
}

export function makeFactor(originalMatrix) {
    var tempMatrix = []; //不用map是因为避免占位
    //1.行相减
    _.each(originalMatrix, (classRow, rowIndex) => {
        if (rowIndex == 0) return;
        var rowFactors = _.map(classRow, (perItem, columnIndex) => _.round(_.subtract(perItem, originalMatrix[0][columnIndex]), 2));
        tempMatrix.push(rowFactors);
    });

    //2.列相减
    var resultMatrix = [];
    _.each(tempMatrix, (rowArr, rowIndex) => {
        var tempRow = [];
        _.each(rowArr, (tempFactor, columnIndex) => {
            if (columnIndex == 0) return;
            tempRow.push(_.round(_.subtract(tempFactor, rowArr[0]), 2));
        });
        resultMatrix.push(tempRow);
    });

    return resultMatrix;
}



/*

function makeTotalScoreLevelInfo(examInfo, examStudentsInfo, examClassesInfo, studentsGroupByClass, levels) {
    //因为levels中是高档次（即score值大的）在前面，所以需要反转顺序
    levels = _.reverse(_.map(levels, (levObj) => levObj.score)) || _.reverse(_.map(makeDefaultLevles(examInfo, examStudentsInfo), (levObj) => levObj.score));
    //用来获取全校各档次的人数  -- segments的最后一个肯定是fullMark，而第一个是最低档的分数
    levels.push(examInfo.fullMark);

    var result = {};

    //获取到分档Map并且过滤到-1的情况（因为最小值是最低分档线，而又学生的成绩会低于最低分档线）
    //{<levelKey>: <students>} 其中levelKey是String类型的，并且值小代表的是低分段（但是levels中）
    var studentsGroupByLevel = _.pickBy(_.groupBy(examStudentsInfo, (student) => findScoreSegmentIndex(levels, student.score)), (v, k) => k > 0);

    //开始创建标准的resultInfo数据结构：
    result.totalSchool = {};

    _.each(studentsGroupByLevel, (students, levelKey) => {
        result.totalSchool[levelKey] = makeLevelInfoItem(students, studentsGroupByLevel);
    });

    _.each(studentsGroupByClass, (studentsFromClass, className) => {
        var classStudentsGroupByLevel = _.pickBy(_.groupBy(studentsFromClass, (student) => findScoreSegmentIndex(levels, student.score)), (v, k) => k > 0);
        var temp = {};
        _.each(classStudentsGroupByLevel, (students, levelKey) => {
            temp[levelKey] = makeLevelInfoItem(students, classStudentsGroupByLevel);
        });
        result[className] = temp;
    });

    return result;
}

// function makeLevelTableRow(rowInfo, levels) {
//     //一定要跟着header走，没有的要填充。这里没有headers，但headers来源于levels
//     return _.concat(_.map(levels, (levObj, levelKey) => { //这里直接遍历levelKey有一个隐形的前提就是 levels一定必须是按照档次由高到低排列的对象
//         //每一个level作为一个unit，里面有三个数据值
//         var levRowObj = rowInfo[levelKey];
//         //有可能此行中没有某一个列属性对象，比如这里有可能某一个班在某一分段没有学生，这个时候需要填充
//         if(!levRowObj) {
//             //如果没有此档次的信息：
//                 if(levelKey != '0') { //如果不是最高档
//                     //则人数是0，累计信息同它的上一档次
//                     var preRowInfo = rowInfo[(levelKey-1)+''];
//                     if(!preRowInfo) throw errors.Error('没有找到前一个档次信息！！！');
//                     return [0, preRowInfo.sumCount, preRowInfo.sumPercentage];
//                 } else {
//                     //如果是最高档则都是0
//                     return [0, 0, '0%'];
//                 }
//         } else {
//             return [levRowObj.count, levRowObj.sumCount, levRowObj.sumPercentage + '%'];
//         }
//     }));
// }

 */


//********************************************************* RankReport *********************************************************

/*
同SchoolAnalysis的 examInfo，examClassesInfo以及examStudentsInfo
 */
/*
examInfo: {
    name: ,
    papers: , //注意要在这里添加 totalScore的信息
    classes:
}

rankCache: {
    totalScore: {
        <className>: [ //已经是有序的（升序）
            {
                kaohao: ,
                name: ,
                class: ,
                score:
            }
        ],
        ...
    },
    <pid>: {
        <className>: [
            {
                kaohao: ,
                name: ,
                class: ,
                score
            }
        ],
        ...
    },
    ...
}

 */
export function fetchRankReportdData(params) {
    var url = (params.grade) ? examPath + '/rank/report?examid=' + params.examid + '&grade=' + params.grade : examPath + '/custom/rank/report?examid=' + params.examid;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}






/*
TODO: 班级表现中算法
计算每个班级 ： 班级排名中位的学生的成绩-班级平均分
组成一个数组
从小到大排序
也有可能都是正数或负数？对正数和负数要加判断说明
正数：考的较差
负数：考的较好
此处正负和减法中减数和被减数的位置有关
 */











































