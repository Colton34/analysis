/*
* @Author: HellMagic
* @Date:   2016-04-10 14:33:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-07 18:01:47
*/

'use strict';


import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
require('moment/locale/zh-cn');//这是moment.local()方法的bug：http://momentjs.com/docs/#/use-it/browserify/

var examPath = "/exam";

/**
 * 从服务端获取Home View数据并且初始化格式化数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function fetchHomeData(params) {
    var url = examPath + '/home';
    return params.request.get(url)
        .then(function(res) {
            try {
                var result = formatExams(res.data);
                return Promise.resolve(result);
            } catch(e) {
                return Promise.reject('fetchHomeData Format Error');
            }
        })
}

/**
 * 从服务端获取Dashboard View数据并且初始化格式化数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function fetchDashboardData(params) {
    var url = examPath + '/dashboard?examid=' + params.examid;

console.log('fetchDashboardData url = ', url);

    return params.request.get(url)
        .then(function(res) {
            var result = {};
            try {

console.log('fetchDashboardData 返回！！！！！！！！！！！');

                result.examGuide = guide(res.data.exam, res.data.papers);
                result.scoreRank = res.data.scoreRank;
                result.levelReport = res.data.levelReport;

console.log('dashboard 格式化数据完成');

                return Promise.resolve(result);
            } catch(e) {
                console.log('fetchDashboardData error ', e);//错误的error可以保留
                return Promise.reject('fetchDashboardData Format error');
            }
        })
    ;
}

/**
 * 从服务端获取SchoolAnalysis View数据并且初始化格式化数据
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function fetchSchoolAnalysisData(params) {
    var url = examPath + '/school/analysis?examid=' + params.examid;
    return params.request.get(url);
}

/**
 * 对exams进行排序格式化，从而符合首页的数据展示
 * @param  {[type]} exams [description]
 * @return {[type]}       [description]
 */
function formatExams(exams) {
    //先对所有exams中每一个exam中的papers进行年级划分：
    var examsGroupByEventTime = _.groupBy(exams, function(exam) {
        var time = moment(exam["event_time"]);
        var year = time.get('year') + '';
        var month = time.get('month') + 1;
        month = (month > 9) ? (month + '') : ('0' + month);
        var key = year + '.' + month;
        return key;
    });

    var result = {}, resultOrder = [];

    _.each(examsGroupByEventTime, function(examsItem, timeKey) {
        //resultOrder是为了建立排序顺序的临时数据结构
        var temp = {};
        _.each(examsItem, function(exam) {
            var flag = {key: timeKey, value: moment(exam['event_time']).valueOf() };
            resultOrder.push(flag);

            temp[exam._id] = {exam: exam};
            var papersFromExamGroupByGrade = _.groupBy(exam["[papers]"], function(paper) {
                return paper.grade;
            });
            temp[exam._id].papersMap = papersFromExamGroupByGrade;
        });

        if(!result[timeKey]) result[timeKey] = [];


//TODO: 注意后面也要跟着这里的papers走，而不再是从数据库中直接获取的exam的papers了！！！那分析一场考试所有的单位都是走这里的，也不再需要什么examid了？或者是examid&grade
//所以后面走分析要传递examid和grade两个参数
        _.each(temp, function(value, key) {
            _.each(value.papersMap, function(papers, gradeKey) {
                var obj = {};
                obj.examName = value.exam.name + "(年级：" + gradeKey + ")";
                obj.grade = gradeKey;
                obj.id = key;
                obj.time = moment(value.exam['event_time']).valueOf();
                obj.eventTime = moment(value.exam['event_time']).format('ll');
                obj.subjectCount = papers.length;
                obj.fullMark = _.sum(_.map(papers, (item) => item.manfen));
                obj.from = value.exam.from; //TODO: 这里数据库里只是存储的是数字，但是显示需要的是文字，所以需要有一个map转换

                result[timeKey].push(obj);
            });
        });

        result[timeKey] = _.orderBy(result[timeKey], [(obj) => obj.time], ['desc']);
    });
    resultOrder = _.orderBy(resultOrder, ['value'], ['desc']);
    var finallyResult = [];
    _.each(resultOrder, function(item) {
        finallyResult.push({timeKey: item.key, value: result[item.key]});
    });

    return finallyResult;
}


/**
 * 格式化“考试总览”模块的数据
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function guide(exam, papers) {

console.log('guide ....');

    var result = {
        subjectCount: 0,
        totalProblemCount: 0,
        classCount: 0,
        totalStudentCount: 0
    };

    result.subjectCount = exam["[papers]"] ? exam["[papers]"].length : 0;
//所有场次考试参加班级的最大数目：
    result.classCount = _.max(_.map(exam["[papers]"], function(paper) {
        return _.size(paper.scores);
    }));
//所有场次不同班级所有的人数总和的最大数目
    result.totalStudentCount = _.max(_.map(exam["[papers]"], function(paper) {
        return _.reduce(paper.scores, function(sum, classScore, classIndex) {
            return sum += classScore.length;
        }, 0)
    }));
//但 examUitls.是为了获取totalQuestions还是要走获取所有的paper实例，因为rank-server的paper.score只是记录了学生当前科目的总分
    result.totalProblemCount = _.reduce(papers, function(sum, paper, index) {
        return sum += (paper["[questions]"] ? paper["[questions]"].length : 0);
    }, 0);

console.log('guide 成功！！！');

    return result;

};


/**
 *格式化"分档"模块的数据格式
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
// function level(papers) {
// //每一个学生的总分-->每一个学生每一个门科目(paper)的总分-->每一个学生每门科目中所有题目的得分

// console.log('level ...');
//     var studentTotalScoreMap = {};
//     _.each(papers, function(paper) {
//         _.each(paper["[students]"], function(student) {
//             if(_.isUndefined(studentTotalScoreMap[student.kaohao])) {
//                 studentTotalScoreMap[student.kaohao] = 0;
//             }
//             studentTotalScoreMap[student.kaohao] += (student.score ? student.score : 0);
//         });
//     });
//     //按照给的分档标准进行分档
//     //这里得到以groupKey为key，value是所有满足分档条件的分数所组成的数组
//     var levelScore = _.groupBy(studentTotalScoreMap, function(score, kaohao) {
//         if(score >= 600) return 'first';
//         if(score >= 520) return 'second';
//         if(score >= 400) return 'third';
//         return 'other';
//     });
//     var result = {};
//     _.each(levelScore, function(value, key) {
//         result[key] = value.length;
//     });

// console.log('level 成功！！！');
//     return result;
// }

// Mock Data:
// export function getMockExamGuide() {
//     return Promise.resolve({
//         subjectCount: 3,
//         totoalProblemCount: 20,
//         classCount: 6,
//         totoalStudentCount: 30
//     });
//     // return axios.get('/api/v1/user/me');
// }

// export function getMockScoreRank() {
//     return Promise.resolve({
//         top: {
//             '魏旭': 688,
//             '肖赫': 670,
//             '朱倩': 666,
//             '徐鹏': 660,
//             '陈宇': 658,
//             '董琛': 656
//         },
//         low: {
//             '王然': 0,
//             '刘涛': 6,
//             '景甜': 8,
//             '范冰冰': 10,
//             '杨颖': 20,
//             '王艳': 26
//         }
//     });
// }

// export function getMockLevelReport() {
//     return Promise.resolve({
//         levels: [['15%', 600], ['20%', 520], ['25%', 480]],
//         levelCountItem: [40, 260, 480]
//     });
// }

// export function getMockClassReport() {
//     return Promise.resolve({
//         title: '初一年级',
//         sortedClass: ['3班', '4班', '5班', '1班', '2班'],
//         sortedScore: [330, 320, 310, 223, 286]
//     });
// }


// export function getMockSubjectReport() {
//     return Promise.resolve({
//         subjects: ['语文', '数学', '英语', '政治', '历史', '地理'],
//         weight: [43000, 19000, 60000, 35000, 17000, 10000]
//     });
// }



