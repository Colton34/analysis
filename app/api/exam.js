/*
* @Author: HellMagic
* @Date:   2016-05-18 18:57:37
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-17 20:41:58
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
    LETTER_MAP as letterMap,
    DEFAULT_LEVELS as defaultLevels,
    DEFAULT_LEVELBUFFER as defaultLevelBuffer,
    DEFAULT_INTENSIVE_LEVELS as defaultIntensiveLevels
} from '../lib/constants';

import {addRankInfo, getLevelInfo, insertRankInfo, newMakeSubjectLevels, newGetLevelInfo, newGetSubjectLevelInfo, getQuestionGroupScoreMatrix, getGroupQuestionMean, getGroupQuestionScoreRate, getQuestionSeparation} from '../sdk';

var examPath = "/exam";
var paperPath = '/papers';

export function initHomeData(params) {
    var url = examPath + '/home';
    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    })
}

export function initDashboardData(params) {
    var url = examPath + '/dashboard?examid=' + params.examid + '&grade=' + encodeURI(params.grade);
    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

export function initRankReportdData(params) {
    var url = examPath + '/rank/report?examid=' + params.examid + '&grade=' + encodeURI(params.grade);
    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

export function initZoubanDS(params) {
    var url = examPath + '/zouban?examid=' + params.examid + '&grade=' + encodeURI(params.grade);
    return params.request.get(url).then(function(res) {
        var {equivalentScoreInfo, examStudentsInfo, examPapersInfo} = res.data;
        var allLessonStudentsMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperObjectId');
        //拿到数据，进行构建需要的DS
        var zoubanExamInfo = getZoubanExamInfo(equivalentScoreInfo, examPapersInfo);
        var zoubanExamStudentsInfo = getZoubanExamStudentsInfo(examStudentsInfo);//TODO:确认通过rank排序！！！
        var zoubanLessonStudentsInfo = getZoubanLessonStudentsInfo(allLessonStudentsMap);
        var zuobanLessonQuestionInfo = getZoubanLessonQuestionInfo(zoubanExamInfo.lessons, allLessonStudentsMap);

        return Promise.resolve({
            zoubanExamInfo: zoubanExamInfo,
            zoubanExamStudentsInfo: zoubanExamStudentsInfo,
            zoubanLessonStudentsInfo: zoubanLessonStudentsInfo,
            zuobanLessonQuestionInfo: zuobanLessonQuestionInfo,
            haveInit: true
        });
    });
}

function getZoubanExamInfo(equivalentScoreInfo, examPapersInfo) {
//lessons要带有顺序
    var result = { id: equivalentScoreInfo.examId, name: equivalentScoreInfo.examName, fullMark: 0 };
    var equivalentScoreInfoMap = _.keyBy(equivalentScoreInfo['[lessons]'], 'objectId'), examPapersInfoMap = _.keyBy(examPapersInfo, 'objectId');
    var commonLessons = [], otherLessons = [], lesson, lessonWeight;
    _.each(equivalentScoreInfoMap, (infoObj, paperObjectId) => {
        result.fullMark += infoObj.fullMark;
        lesson = _.assign({}, infoObj, {questions: examPapersInfoMap[paperObjectId].questions});
        lessonWeight = _.findIndex(subjectWeight, (s) => ((s == infoObj.name) || (_.includes(infoObj.name, s))));
        (lessonWeight >= 0) ? commonLessons.push({weight: lessonWeight, value: lesson}) : otherLessons.push(lesson);
    });
    commonLessons = _.chain(commonLessons).sortBy('weight').map((obj) => obj.value).value();
    result.lessons = _.concat(commonLessons, otherLessons);
    return result;
}

function getZoubanExamStudentsInfo(examStudentsInfo) {
    var zoubanExamStudentsInfo = _.map(examStudentsInfo, (obj) => _.pick(obj, ['id', 'kaohao', 'xuehao', 'name', 'class', 'score']));
    insertRankInfo(zoubanExamStudentsInfo);
    zoubanExamStudentsInfo = _.sortBy(zoubanExamStudentsInfo, 'rank');
    return zoubanExamStudentsInfo;
}

function getZoubanLessonStudentsInfo(allLessonStudentsMap) {
    var result = {};
    _.each(allLessonStudentsMap, (lessonStudents, paperObjectId) => {
        result[paperObjectId] = {};
        insertRankInfo(lessonStudents, 'lessonRank');
        _.each(_.groupBy(lessonStudents, 'class_name'), (lessonClassStudents, className) => {
            insertRankInfo(lessonClassStudents, 'classRank');
            result[paperObjectId][className] = lessonClassStudents;
        });
    });
    return result;
}

function getZoubanLessonQuestionInfo(lessons, allLessonStudentsMap) {
    var result = {}, lessonStudents, allQuestionsLessonInfo, lessonClassStudentsMap, allQuestionsLessonClassInfo, questions, obj;
    _.each(lessons, (lessonObj) => {
        lessonStudents = allLessonStudentsMap[lessonObj.objectId], questions = lessonObj.questions;
        allQuestionsLessonInfo = getQuestionsInfo(lessonStudents, questions, true);
        lessonClassStudentsMap = _.groupBy(lessonStudents, 'class_name');
        allQuestionsLessonClassInfo = {};
        _.each(lessonClassStudentsMap, (lessonClassStudents, className) => {
            allQuestionsLessonClassInfo[className] = getQuestionsInfo(lessonClassStudents, questions);
        });

        result[lessonObj.objectId] = _.map(questions, (questionObj, index) => {
            obj = { lesson: allQuestionsLessonInfo[index] };
            _.each(allQuestionsLessonClassInfo, (questionLessonClassInfoArr, className) => {
                obj[className] = questionLessonClassInfoArr[index];
            });
            return obj;
        });
    });
    return result;
}

function getQuestionsInfo(lessonStudents, questions, isAllLesson) {
    var questionScores, questionMeans, questionRates, questionSeparations;
    questionScores = getQuestionGroupScoreMatrix(lessonStudents);
    questionMeans = getGroupQuestionMean(questionScores);
    questionRates = getGroupQuestionScoreRate(questions, questionMeans);
    if(isAllLesson) questionSeparations = getQuestionSeparation(questionScores, _.map(lessonStudents, (studentObj) => studentObj.score));
    var obj;
    var result = _.map(_.range(questions.length), (i) => {
        obj = {
            scores: questionScores[i],
            mean: questionMeans[i],
            rate: questionRates[i]
        };
        if(isAllLesson) obj.separations = questionSeparations[i];
        return obj;
    })
    return result;
}

function getZoubanDS({equivalentScoreInfo, examStudentsInfo}) {
    //带有order的课程 (lesson)
    //每个学科下的教学班（group）
    //
}

export function initReportBase(params) {
    var url = examPath + '/school/analysis?examid=' + params.examid + '&grade=' + encodeURI(params.grade);
    return params.request.get(url).then(function(res) {
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, examBaseline} = res.data;
        var examFullMark = examInfo.fullMark;
        insertRankInfo(examStudentsInfo);
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperid');
        _.each(allStudentsPaperMap, (paperStudents) => insertRankInfo(paperStudents));
        var headers = getExamHeaders(examPapersInfo, examInfo.fullMark);
        var levels = getExamLevels(examBaseline, examStudentsInfo, examFullMark);
        var subjectLevels = getExamSubjectLevels(examBaseline, levels, examStudentsInfo, examPapersInfo, examFullMark, allStudentsPaperMap);
        if(!doubleCheckValidSubjectLevels(subjectLevels)) {
            levels = newGetLevelInfo(defaultIntensiveLevels, examStudentsInfo, examFullMark, false);
            subjectLevels = getExamSubjectLevels(examBaseline, levels, examStudentsInfo, examPapersInfo, examFullMark, allStudentsPaperMap);
            //得到新的再进行检测一次，如果还是不满足条件则抛出异常
            if(!doubleCheckValidSubjectLevels(subjectLevels)) return Promise.reject('无效的学科平均分');
        }
        var levelBuffers = getExamLevelBuffers(examBaseline, _.size(levels));
        //Note: studentsGroupByClass 其实应该是studentsGroupByKey -- 但是这个因为需要isLianKao的标志--所以还是推迟到具体的报告container中计算就好
        return Promise.resolve({
            haveInit: true,
            examInfo: examInfo,
            examStudentsInfo: examStudentsInfo,
            examPapersInfo: examPapersInfo,
            examClassesInfo: examClassesInfo,
            allStudentsPaperMap: allStudentsPaperMap,
            headers: headers,
            levels: levels,
            subjectLevels: subjectLevels,
            levelBuffers: levelBuffers
        });
    });
}

function doubleCheckValidSubjectLevels(subjectLevels) {
    var result = {};
    _.each(subjectLevels, (subjectLevelObj, index) => {
        _.each(subjectLevelObj, (obj, pid) => {
            if(!result[pid]) result[pid] = [];
            result[pid].push(obj.score);
        });
    });
    var temp = _.every(result, (subjectLevelScores, pid) => {
        return _.every(_.range(subjectLevelScores.length-1), (i) => subjectLevelScores[i] > subjectLevelScores[i+1]);
    });
    debugger;
    return temp;
}

function getExamHeaders(examPapersInfo, examFullMark) {
    var headers = [], restPapers = [];
    _.each(examPapersInfo, (paperItem, pid) => {
        var index = _.findIndex(subjectWeight, (s) => ((s == paperItem.subject) || (_.includes(paperItem.subject, s))));
        if (index >= 0) {
            headers.push({
                index: index,
                subject: paperItem.subject,
                id: pid,
                fullMark: paperItem.fullMark
            });
        } else {
            restPapers.push({id: pid, subject: paperItem.subject});
        }
    });
    headers = _.sortBy(headers, 'index');
    headers.unshift({
        subject: '总分',
        id: 'totalScore',
        fullMark: examFullMark
    });
    headers = _.concat(headers, restPapers);
    return headers;
}

function getExamLevels(examBaseline, examStudentsInfo, examFullMark) {
    if(examBaseline && examBaseline['[levels]']) return examBaseline['[levels]'];
    return newGetLevelInfo(defaultLevels, examStudentsInfo, examFullMark, false);
}

function getExamSubjectLevels(examBaseline, levels, examStudentsInfo, examPapersInfo, examFullMark, allStudentsPaperMap) {
    if(examBaseline && examBaseline['[subjectLevels]']) return examBaseline['[subjectLevels]'];
    var subjectLevels = newMakeSubjectLevels(levels, examStudentsInfo, examPapersInfo, examFullMark);
    var papersFullMark = {};
    _.each(examPapersInfo, (obj, pid) => papersFullMark[pid] = obj.fullMark);
    return newGetSubjectLevelInfo(subjectLevels, allStudentsPaperMap, papersFullMark);
}

function getExamLevelBuffers(examBaseline, levelSize) {
    if(examBaseline && examBaseline['[levelBuffers]']) return examBaseline['[levelBuffers]'];
    return _.map(_.range(levelSize), (i) => defaultLevelBuffer);
}

export function initReportDS(params) {
    var url = examPath + '/school/analysis?examid=' + params.examid + '&grade=' + encodeURI(params.grade);

    var examInfo, examStudentsInfo, examPapersInfo, examClassesInfo;
    var studentsGroupByClass, allStudentsPaperMap;
    var headers = [];
    var levels;

    return params.request.get(url).then(function(res) {
        var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, examBaseline} = res.data;
        addRankInfo(examStudentsInfo);
        var studentsGroupByClass = _.groupBy(examStudentsInfo, 'class'); //TODO：联考studentsGroupBySchool，然后在所有联考里都使用这一个。
        var allStudentsPaperMap = _.groupBy(_.concat(..._.map(examStudentsInfo, (student) => student.papers)), 'paperid');
        var examStudentsInfoMap = _.keyBy(examStudentsInfo, 'id');
        //Note: 已经对paperStudents进行排序，这样到下面不用分别都再次排序了。
        var rankIndex;
        _.each(allStudentsPaperMap, (students, pid) => {
            // allStudentsPaperMap[pid] = _.sortBy(students, 'score');
            //Note: 已经把排名的信息补充进来
            rankIndex = 1;
            var papserStudentsByScore = _.groupBy(students, 'score');
            var papserStudentsByScoreInfo = _.map(papserStudentsByScore, (v, k) => {
                return {
                    score: parseFloat(k),
                    students: v
                }
            });
            var orderedPaperStudentScoreInfo = _.orderBy(papserStudentsByScoreInfo, ['score'], ['desc']);
            var finalRankStudentsInfo = [];
            _.each(orderedPaperStudentScoreInfo, (theObj, theRank) => {
                var currentRankStudents = _.map(theObj.students, (stuObj) => {
                    stuObj.rank = (rankIndex);
                    if(!examStudentsInfoMap[stuObj.id]) {
                        debugger;
                    }
                    stuObj.school = examStudentsInfoMap[stuObj.id].school;
                    return stuObj;
                });
                finalRankStudentsInfo = _.concat(finalRankStudentsInfo, currentRankStudents);
                rankIndex += currentRankStudents.length;
            });
            _.reverse(finalRankStudentsInfo);
            allStudentsPaperMap[pid] = finalRankStudentsInfo;
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
        debugger;
        var levels = (examBaseline && examBaseline['[levels]']) ? _.keyBy(examBaseline['[levels]'], 'key') : makeDefaultLevles(examInfo, examStudentsInfo);
        debugger;
        var levelBuffers = (examBaseline && examBaseline['[levelBuffers]']) ? _.map(examBaseline['[levelBuffers]'], (obj) => obj.score) : _.map(levels, (value, key) => 10);
//设计：虽然把subjectLevels挂到state树上--其实是借用reportDS来存储，在校级报告里不直接用，而是在其他报告中直接用，校级报告中等于多算一遍。这个设计可能需要重构。
        var subjectLevels = (examBaseline && examBaseline['[subjectLevels]']) ? getSubjectLevelsFromBaseLine(examBaseline['[subjectLevels]']) : makeDefaultSubjectLevels(levels, examStudentsInfo, examPapersInfo, examInfo.fullMark);
        debugger;
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
            return (des == _.last(segments)) ? middle - 1 : middle;
        } else if (des < segments[middle]) {
            high = middle - 1;　　
        } else {
            low = middle + 1;
        }
    }
    return high;
}

/**
 * 默认3档，每一档有固定的上线率，根据上线率计算出相应的分档分数线。固定的三个档次的上线率分别是15%, 35%, 60%。
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
            sumCount: 0,
            percentage: 60,
            key: '0'
        },
        '1': {
            score: 0,
            count: 0,
            sumCount: 0,
            percentage: 35,
            key: '1'
        },
        '2': {
            score: 0,
            count: 0,
            sumCount: 0,
            percentage: 15,
            key: '2'
        }
    };

    var result = getLevelInfo(levels, examStudentsInfo, examInfo.fullMark, false);
    debugger;
    return result;

    // _.each(levels, (levelObj, levelKey) => {
    //     var {count, score, percentage} = getLevelsByPercentage(levels, levelKey, levelObj.percentage, examStudentsInfo, examInfo.fullMark);
    //     levelObj.count = count;
    //     levelObj.score = score;
    //     levelObj.percentage = percentage;
    // });
    // return levels;
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

function getLevelsByPercentage(levels, levelKey, defalutPercentage, examStudentsInfo, examFullMark) {
    var levelLastIndex = _.size(levels) - 1;
    if(levelKey == '0') {//低档次
        var flagCount = _.ceil(_.multiply(_.divide(defalutPercentage, 100), examStudentsInfo.length));
        var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
        var currentLevelScore = targetStudent.score;

        var highFlagCount = _.ceil(_.multiply(_.divide(levels[(parseInt(levelKey)+1)+''].percentage, 100), examStudentsInfo.length));
        var highTargetStudent = _.takeRight(examStudentsInfo, highFlagCount)[0];
        var highLevelScore = highTargetStudent.score;

        var count = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score < highLevelScore)).length;
        var sumCount = _.filter(examStudentsInfo, (obj) => obj.score >= currentLevelScore).length;
        var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
        return {
            count: count,
            sumCount: sumCount,
            score: currentLevelScore,
            percentage: sumPercentage
        }
    } else if(levelKey == levelLastIndex+'') {
        var flagCount = _.ceil(_.multiply(_.divide(defalutPercentage, 100), examStudentsInfo.length));
        var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
        var currentLevelScore = targetStudent.score;

        var highLevelScore = examFullMark;
        var count = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score <= highLevelScore)).length;
        var sumCount = count;
        var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
        return {
            count: count,
            sumCount: sumCount,
            score: currentLevelScore,
            percentage: sumPercentage
        }
    } else {
        var flagCount = _.ceil(_.multiply(_.divide(defalutPercentage, 100), examStudentsInfo.length));
        var targetStudent = _.takeRight(examStudentsInfo, flagCount)[0];
        var currentLevelScore = targetStudent.score;

        var highFlagCount = _.ceil(_.multiply(_.divide(levels[(parseInt(levelKey)+1)+''].percentage, 100), examStudentsInfo.length));
        var highTargetStudent = _.takeRight(examStudentsInfo, highFlagCount)[0];
        var highLevelScore = highTargetStudent.score;

        // var highLevelScore = levels[(parseInt(levelKey)+1)+''].score;
        var count = _.filter(examStudentsInfo, (obj) => (obj.score >= currentLevelScore) && (obj.score < highLevelScore)).length;
        var sumCount = _.filter(examStudentsInfo, (obj) => obj.score > currentLevelScore).length;
        var sumPercentage = _.round(_.multiply(_.divide(sumCount, examStudentsInfo.length), 100), 2);
        return {
            count: count,
            sumCount: sumCount,
            score: currentLevelScore,
            percentage: sumPercentage
        }
    }
}

export function saveBaseline(params) {
    var url = examPath + '/levels';

    return params.request.put(url, {examId: params.examId, baseline: params.baseline});
}

export function fetchEquivalentScoreInfoList(params) {
    var url = examPath + '/equivalent/list';
    return params.request.get(url).then(function(res) {
        return Promise.resolve(res.data);
    });
}

export function setEquivalentScoreInfo(params) {
    var url = examPath + '/equivalent/score';
    return params.request.post(url, {equivalentScoreInfo: params.equivalentScoreInfo});
    // .then(function(res) {
    //     console.log(res.data);
    //     debugger;
    //     return Promise.resolve('ok');
    // }).catch(function(err) {
    //     console.log(err);
    //     debugger;
    // })
}




// export function initLiankaoReportDS(params) {
//     var url = examPath + '/school/analysis?examid=' + params.examid + '&grade=' + encodeURI(params.grade);

//     return params.request.get(url).then(function(res) {
//         var {examInfo, examStudentsInfo, examPapersInfo, examClassesInfo, liankaoBaseline} = res.data;
//         var levels = (examBaseline && examBaseline['[levels]']) ? _.keyBy(examBaseline['[levels]'], 'key') : makeDefaultLevles(examInfo, examStudentsInfo);
//         var levelBuffers = (examBaseline && examBaseline['[levelBuffers]']) ? _.map(examBaseline['[levelBuffers]'], (obj) => obj.score) : _.map(levels, (value, key) => 5);
//         var subjectLevels = (examBaseline && examBaseline['[subjectLevels]']) ? getSubjectLevelsFromBaseLine(examBaseline['[subjectLevels]']) : makeDefaultSubjectLevels(levels, examStudentsInfo, examPapersInfo, examInfo.fullMark);
//         return Promise.resolve({
//             haveInit: true,
//             examInfo: examInfo,
//             examStudentsInfo: examStudentsInfo,
//             examPapersInfo: examPapersInfo,
//             examClassesInfo: examClassesInfo,
//             levels: levels,
//             subjectLevels: subjectLevels,
//             levelBuffers: levelBuffers
//         });
//     });
// }
