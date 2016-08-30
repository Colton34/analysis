/*
* @Author: HellMagic
* @Date:   2016-05-18 18:57:37
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-30 18:42:45
*/


/*
Note:【设计】
    1. paperId === _id，即是ObjectId  pid === id 即是StringId。如果有paper那么id就是StringId，如果没有那么id是ObjectId。pid应该一定是指StringId
    2. segments和区间段的表示法描述：
    segments: [<start>, <stepTwo>, <stepThree>, ... , <end> ]  length=n
    注意，segments中都是【从小到大】顺序的排列，但是有些显示的时候需要从大到小显示，那样需要显示的地方自己reverse，比如档次从高档到低档显示
    区间段：由segments依次相邻的两个刻度形成。[<start>, <stepTwo>], (<stepTwo, stepThree>], (], ... (<>, <end>]   (n-1)个 注意：【左开右合】
    如果segments设置的最小（大）值不是所有查询值中的最小（大）值，那么给出的index就会有-1（或者当超过最大值的时候是 (segments.length-1)）出现，但是从设计上考虑不应
    该出现这两个值。剩下的[0~segments.length-2]这共segments.length-1个值分别对应
    (segments.length-1)个区段。
 */

'use strict';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
//Note: 这是moment.local()方法的bug：http://momentjs.com/docs/#/use-it/browserify/
require('moment/locale/zh-cn');
var errors = require('common-errors');

import {
    SUBJECTS_WEIGHT as subjectWeight,
    NUMBER_MAP as numberMap,
    LETTER_MAP as letterMap
} from '../lib/constants';

var examPath = "/exam";
var paperPath = '/papers';

/**
 * 获取Home格式化好的视图数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function initHomeData(params) {
    var url = examPath + '/home';

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    })
}

export function saveBaseline(params) {
    var url = examPath + '/levels';

    return params.request.put(url, {examId: params.examId, baseline: params.baseline});
}

/**
 * 获取Dashboard API数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function initDashboardData(params) {
    var url = (params.grade) ? examPath + '/dashboard?examid=' + params.examid + '&grade=' + encodeURI(params.grade) : examPath + '/custom/dashboard?examid=' + params.examid;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}


/**
 * 获取排行榜详情的API数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
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
export function initRankReportdData(params) {
    var url = (params.grade) ? examPath + '/rank/report?examid=' + params.examid + '&grade=' + encodeURI(params.grade) : examPath + '/custom/rank/report?examid=' + params.examid;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

/**
 * 获取校级报告详情的API数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]

组织的数据结构格式：
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
                ],
                questionScores: [
                    {paperid: , scores: [], answers: [] }
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
                classes: {
                    <className>: <此科目此班级参加考试的人数>
                },
                questions:
            },
            ...
        }

    examClassesInfo
        {
            <className>: {
                name:
                students:
                realStudentsCount:
                losstStudentsCount:
            }
        }

    headers:
        [
            {
                id: 'totalScore',
                subject: '总分'
            },
            {
                id:xxx,
                subject:'语文' ,
                index:xxx
            },
            ...
        ]

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
subjectLevels:
    存储的是个array: [ { levelKey: xxx, values: {} } ]
    state中是个Map: { <levelKey> : <values> }
 */
export function initReportDS(params) {
    var url = (params.grade) ? examPath + '/school/analysis?examid=' + params.examid + '&grade=' + encodeURI(params.grade) : examPath + '/custom/school/analysis?examid=' + params.examid;

    var examInfo, examStudentsInfo, examPapersInfo, examClassesInfo;
    var studentsGroupByClass, allStudentsPaperMap;
    var headers = [];
    var levels;

    return params.request.get(url).then(function(res) {
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, examBaseline} = res.data;
        var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class');
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperid');
        //TODO:打开；对paperStudents进行排序，这样到下面不用分别都再次排序了。
        _.each(allStudentsPaperMap, (students, pid) => {
            allStudentsPaperMap[pid] = _.sortBy(students, 'score');
        });
        var headers = [], restPapers = [];
        _.each(examPapersInfo, (paper, pid) => {
            var index = _.findIndex(subjectWeight, (s) => ((s == paper.subject) || (_.includes(paper.subject, s))));
            if (index >= 0) {
                headers.push({
                    index: index,
                    subject: paper.subject,
                    id: pid,
                    fullMark: paper.fullMark
                });
            } else {
                restPapers.push({id: pid, subject: paper.subject});
            }
        });
        headers = _.sortBy(headers, 'index');
        headers.unshift({
            subject: '总分',
            id: 'totalScore'
        });
        headers = _.concat(headers, restPapers);
        var levels = (examBaseline && examBaseline['[levels]']) ? _.keyBy(examBaseline['[levels]'], 'key') : makeDefaultLevles(examInfo, examStudentsInfo);
        var levelBuffers = (examBaseline && examBaseline['[levelBuffers]']) ? _.map(examBaseline['[levelBuffers]'], (obj) => obj.score) : _.map(levels, (value, key) => 5);
//设计：虽然把subjectLevels挂到state树上--其实是借用reportDS来存储，在校级报告里不直接用，而是在其他报告中直接用，校级报告中等于多算一遍。这个设计可能需要重构。
        var subjectLevels = (examBaseline && examBaseline['[subjectLevels]']) ? getSubjectLevelsFromBaseLine(examBaseline['[subjectLevels]']) : makeDefaultSubjectLevels(levels, examStudentsInfo, examPapersInfo, examInfo.fullMark);
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
            subjectLevels: subjectLevels,
            levelBuffers: levelBuffers
        });
    });
}


function getSubjectLevelsFromBaseLine(originalSubjectLevels) {
    var result = {};
    _.each(originalSubjectLevels, (obj) => {
        result[obj.levelKey] = _.keyBy(obj.values, 'id');
    });
    return result;
}

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
 * 获取所给学生(students)在由segments形成的总分（因为这里取得是student.score
 * --可以扩展）区间段中的分布（个数）
 * @param  {[type]} students [description]
 * @param  {[type]} segments [description]
 * @return 和segments形成的区间段一一对应的分布数数组
 */
export function makeSegmentsCount(students, segments) {
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

export function makeSegmentsCountInfo(students, segments) {
    var groupStudentsBySegments = _.groupBy(students, function(item) {
        return findScoreSegmentIndex(segments, item.score);
    });
    var result = _.map(_.range(segments.length - 1), function(index) {
        return (groupStudentsBySegments[index]) ? groupStudentsBySegments[index] : []
    });

    return result;
}

/**
 * 将一个matrix通过行列操作计算离差
 * @param  {[type]} originalMatrix [description]
 * @return {[type]}                [description]
 */
export function makeFactor(originalMatrix) {
    var tempMatrix = []; //不用map是因为避免占位
    //1.行相减
    _.each(originalMatrix, (classRow, rowIndex) => {
        if (rowIndex == 0) return;
        var rowFactors = _.map(classRow, (perItem, columnIndex) => (_.isNumber(perItem) ? _.round(_.subtract(perItem, originalMatrix[0][columnIndex]), 2) : perItem));
        tempMatrix.push(rowFactors);
    });

    //2.列相减
    var resultMatrix = [];
    _.each(tempMatrix, (rowArr, rowIndex) => {
        var tempRow = [];
        _.each(rowArr, (tempFactor, columnIndex) => {
            if (columnIndex == 0) return;
            var resultTempFactor = (_.isNumber(tempFactor)) ? _.round(_.subtract(tempFactor, rowArr[0]), 2) : tempFactor;
            tempRow.push(resultTempFactor);
        });
        resultMatrix.push(tempRow);
    });

    return resultMatrix;
}

/**
 * 自定义分析中选中一个paper获取此paper的详情
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function fetchPaper(params) {
    var url = (params.isFromCustom) ? paperPath + '/' + params.pid + '/exam/' + params.examId : paperPath + '/' + params.pid;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

//Note: 历史分析的examList不带有自定义的！！！所以自定义的进来也走相同的逻辑没有问题。。。。吧？
export function initExamCache(params) {
    var url = examPath + '/init/examcache?schoolId='+ params.schoolId +'&grade='+ params.grade +'&currentClass=' + params.currentClass;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

export function getMoreExamsInfo(params) {
    var ids = JSON.stringify(params.examids);
    var url = examPath + '/get/more?examids=' + ids +'&grade=' + params.grade + '&currentClass=' + params.currentClass;

    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}


/**
 * 使用二分法找到一个目标分数在所给的segments中所处的区间index。
 * Note: 注意这里有可能返回-1（比最小值还要小）和(segments.legnth-1)（比最大值还大）。[0~segment.length-2]是正确的值
 * @param  {[type]} segments [description]
 * @param  {[type]} des      [description]
 * @return {[type]}          [description]
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
    return high;
}

/**
 * 默认3档，每一档有固定的上线率，根据上线率计算出相应的分档分数线。固定的三个档次的上线率分别是15%, 25%, 60%。
 * Note: 1.这里的levelKey是String类型的，但是有些时候（特别是通过findScoreSegmentIndex得到的返回值是Integer类型的，而对于Map的key来说，类型一定也要相同才能匹配到）得到的不是String类型，那么需要转换。
 *       2.parseInt(levelKey)值越小则等级越小（这点符合数据的直观性），但是一般视图展示的时候都是等级较高的放在前面，所以切记需要调整顺序。
 *       3.没有特殊情况（比如letterMap，0在展示上没有意义）则一般都是从'0'开始！
 *       4.这里的percentage是“累计占比”。比如这里“0”对应的三挡percentage是60%--意味着1档+2档+3档一共占比60%（剩余的是小于三挡的）
 * @param  {[type]} examInfo         [description]
 * @param  {[type]} examStudentsInfo [description]
 * @return {[type]}                  [description]
 */
function makeDefaultLevles(examInfo, examStudentsInfo) {
    var levels = {
        '0': {
            score: 0,
            count: 0,
            percentage: 60
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

        var flagCount = _.ceil(_.multiply(_.divide(levObj.percentage, 100), totalStudentCount));
        var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];

        levObj.score = targetStudent.score;
        var targetIndex;
        if(levelKey == '0') {
            targetIndex = _.findIndex(examStudentsInfo, (student) => student.score >= levObj.score);
        } else {
            targetIndex = _.findIndex(examStudentsInfo, (student) => student.score > levObj.score);
        }
        var targetCount = examStudentsInfo.length - targetIndex;
        levObj.count = targetCount;
    });
    return levels;
}

//Note:在存储的时候因为是Map所以必须存储成数组，但是使用的时候一定是Map--即在state中的形式是Map
function makeDefaultSubjectLevels(levels, examStudentsInfo, examPapersInfo, examFullMark) {
    var result = {};
    _.each(levels, (levObj, levelKey) => {
        result[levelKey] = makeLevelSubjectMean(levObj.score, examStudentsInfo, examPapersInfo, examFullMark);
    });
    return result;
}


//计算每一档次各科的平均分
//算法：获取所有考生基数中 总分**等于**此档分数线 的所有考生；如果这些考生的人数不足够样本数（当前是固定值25），则扩展1分（单位），再获取，注意：
//  1.分数都四舍五入（包括分档线）
//  2.一定要滑动窗口两边的数量是相同的，保证平均分不变（注意有“选择的某个分数上没有对应学生的情况”）
//  3.当遇到从n中取m（其中n > m）
//  一定要保证每次取的人都是相同的（根据examStudentsInfo的顺序），这样每次计算的科目平局分才是相同的
//  ，不断重复上述过程，直到满足样本数量
//TODO: 抽离此方法
function makeLevelSubjectMean(levelScore, examStudentsInfo, examPapersInfo, examFullMark) {
    var result = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(levelScore));
    var count = result.length;

    var currentLowScore, currentHighScore;
    currentLowScore = currentHighScore = _.round(levelScore);

    while ((count < 25) && (currentLowScore >= 0) && (currentHighScore <= examFullMark)) {
        currentLowScore = currentLowScore - 1;
        currentHighScore = currentHighScore + 1;
        var currentLowStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentLowScore));
        var currentHighStudents = _.filter(examStudentsInfo, (student) => _.round(student.score) == _.round(currentHighScore));

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
//TODO: 抽离此方法
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
