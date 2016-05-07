/*
* @Author: HellMagic
* @Date:   2016-04-30 13:32:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-07 18:39:51
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var client = require('request');
var moment = require('moment');

var config = require('../../config/env');

/**
 * 通过schoolid获取学校
 * @param  {[type]} schoolid [description]
 * @return {[type]}          [description]
 */
exports.getSchoolById = function(schoolid) {
    //通过exam.schoolid获取school实例，然后school.grades->classes reduce出来
    return when.promise(function(resolve, reject) {
        peterMgr.get('@School.'+schoolid, function(err, school) {
            if(err || !school) return reject(new errors.data.MongoDBError('find school:'+schoolid+' error', err));
            resolve(school);
        });
    });
};

/**
 * 获取此学校所发生过的所有exam的具体实例
 * @param  {[type]} school [description]
 * @return {[type]}        [description]
 */
exports.getExamsBySchool = function(school) {
    var examPromises = _.map(school["[exams]"], function(item) {
        return fetchExamPromise(item.id);
    });
    return when.all(examPromises);
}

function fetchExamPromise(examid) {
    return when.promise(function(resolve, reject) {
        peterMgr.get('@Exam.' + examid, function(err, exam) {
            if(err) return reject(new errors.data.MongoDBError('find exam:'+examid+ ' error', err));
            resolve(exam);
        });
    });
}

/**
 * 通过examid查询获取一个exam实例
 * @param  {[type]} examid [description]
 * @return {[type]}        [description]
 */
exports.getExamById = function(examid) {
    var url = config.rankBaseUrl + '/exams' + '?' + 'examids=' + examid;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(exams)失败', err));
            resolve(JSON.parse(body)[examid]);//这里必须反序列化--因为是通过网络传输的全部都是String
        });
    });
};

exports.getScoresByExamid = function(examid) {
    //Mock Data
    // var arr = {
    //         'A': [{name: 'aa', score: 12, class: 'A'}, {name: 'bb', score: 20, class: 'A'}],
    //         'B': [{name: 'cc', score: 2, class: 'B'}, {name: 'dd', score: 50, class: 'B'}],
    //         'C': [{name: 'aa', score: 100, class: 'A'}, {name: 'bb', score: 39, class: 'A'}],
    //         'D': [{name: 'cc', score: 65, class: 'B'}, {name: 'dd', score: 5, class: 'B'}],
    //         'E': [{name: 'aa', score: 1, class: 'A'}, {name: 'bb', score: 180, class: 'A'}],
    //         'F': [{name: 'cc', score: 200, class: 'B'}, {name: 'dd', score: 0, class: 'B'}],
    //         'G': [{name: 'aa', score: 111, class: 'A'}, {name: 'bb', score: 24, class: 'A'}],
    //         'H': [{name: 'cc', score: 90, class: 'B'}, {name: 'dd', score: 76, class: 'B'}],
    //         'I': [{name: 'aa', score: 500, class: 'A'}, {name: 'bb', score: 390, class: 'A'}],
    //         'G': [{name: 'cc', score: 165, class: 'B'}, {name: 'dd', score: 75, class: 'B'}],
    //         'K': [{name: 'aa', score: 16, class: 'A'}, {name: 'bb', score: 20, class: 'A'}],
    //         'L': [{name: 'cc', score: 300, class: 'B'}, {name: 'dd', score: 60, class: 'B'}]
    //     };
    // return when.resolve(arr);

    var url = config.testRankBaseUrl + '/scores' + '?' + 'examid=' + examid;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(scores)失败', err));
            var data = JSON.parse(body);
            var keys = _.keys(data);
            resolve(data[keys[0]]);
        });
    });
};

exports.getAllPapersByExam = function(exam) {
    var findPapersPromises = _.map(exam["[papers]"], function(pobj) {
        return when.promise(function(resolve, reject) {
            peterMgr.get(pobj.paper, function(err, paper) {
                if(err) return reject(new errors.data.MongoDBError('find paper:'+pid+' error', err));
                resolve(paper);
            });
        });
    });
    return when.all(findPapersPromises);
};





/**
 * 根据固定的分档规则惊醒区分分数段（因为分数段较多，且学生更多，所以采用二分法去分段而没有采用遍历group的方式--虽然代码可读性更高）
 * @param  {[type]} score [description]
 * @return {[type]}       [description]
 *
测试用例：
var result = {};
_.each(_.range(30), function() {
    var score = _.random(600);
    var key = getLevelByScore(score);
    result[key] = score;
})
*/
exports.getLevelByScore = function(score) {
    if(score > 350) {
        if(score > 500) {
            if(score > 550) return '(550, 600]'; //注意这里满分就只能是600
            return '(500, 550]';
        } else if(score > 400) {
            if(score > 450) return '(450, 500]';
            return '(400, 450]';
        } else {
            return '(350, 400]'
        }
    } else {
        if(score > 200) {
            if(score > 300) return '(300, 350]';
            if(score > 250) return '(250, 300]';
            return '(200, 250]';
        } else if(score > 100) {
            if(score > 150) return '(150, 200]';
            return '(100, 150]';
        } else if(score > 50) {
            return '(50, 100]';
        } else {
            return '[0, 50]';
        }
    }
}

//其实分析结果只要出一次就可以了，后面考试一旦考完，数据肯定就是不变的，但是出数据的颗粒度需要设计，因为前端会有不同的维度--所以还是需要计算
/**
 * 为SchoolAnalysis提供设计好的方便灵活的数据结构
 * @param  {[type]} exam   [description]
 * @param  {[type]} papers [description]
 * @param  {[type]} school [description]
 * @return {[type]}        [description]
 */
exports.generateStudentScoreInfo = function(exam, papers, school) {
    //学生的信息；-- @Paper   id, name, totalScore(来自score的接口), class
    //学科的信息  -- @Paper   <paper_score>
    // var studentTotalScoreMap = {};
    var studentScoreInfoMap = {};
    var paperInfo = {};
    var classInfo = {};
    _.each(papers, function(paper) {
        paperInfo[paper.id] = {
            name: paper.name,
            event_time: paper.event_time,
            fullMark: paper.manfen
        };
        _.each(paper["[students]"], function(student) {
        //确认：选用学生的id作为索引（虽然也可以用kaohao--因为是在同一场考试下）
            if(!studentScoreInfoMap[student.id]) {
                //TODO：重构--这个赋值的操作可以使用ES6的简单方式
                var obj = {};
                obj.id = student.id;
                obj.kaohao = student.kaohao;
                obj.name = student.name;
                obj.class = student.class;
                studentScoreInfoMap[student.id] = obj;
            }
            //这里赋给0默认值，就不能区分“缺考”（undefined）和真实考了0分
            studentScoreInfoMap[student.id][paper.id] = student.score || 0;
            studentScoreInfoMap[student.id].totalScore = (studentScoreInfoMap[student.id].totalScore) ? (studentScoreInfoMap[student.id].totalScore + studentScoreInfoMap[student.id][paper.id]) : (studentScoreInfoMap[student.id][paper.id]);
        });
    });
    //确定基数到底是此班级内参加此场paper考生的人数还是此班级所有学生的人数（应该是前者，否则计算所有的数据都有偏差，但是缺考人数还是需要
    //班级的总人数）
    _.each(school['[grades]'], function(grade) {
        _.each(grade['[classes]'], function(classItem) {
            classInfo[classItem.name] = {
                studentsCount: (classItem.students ? classItem.students.length : 0),
                grade: grade.name
            }
        });
    });
    return {
        studentScoreInfoMap: studentScoreInfoMap,
        paperInfo: paperInfo,
        classInfo: classInfo
    };
}





/*
    请求rank-server "/schools"的API接口：
    var url = config.rankBaseUrl + '/schools?ids=' + schoolId;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(schools)失败', err));
            resolve(JSON.parse(body)[schoolId]);
        })
    })

 */
