/*
* @Author: HellMagic
* @Date:   2016-04-30 13:32:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 17:15:45
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var client = require('request');

var config = require('../../config/env');


exports.getSchoolById = function(schoolid) {
    //通过exam.schoolid获取school实例，然后school.grades->classes reduce出来
    return when.promise(function(resolve, reject) {
        peterMgr.get('@School.'+schoolid, function(err, school) {
            if(err || !school) return reject(new errors.data.MongoDBError('find school:'+schoolid+' error', err));
            resolve(school);
        });
    });
};


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



exports.getExamById = function(examid) {
    var url = config.rankBaseUrl + '/exams' + '?' + 'examids=' + examid;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server(exams)失败', err));
            resolve(JSON.parse(body)[examid]);//这里必须反序列化--因为是通过网络传输的全部都是String
        });
    });
};

exports.getScoresById = function(examid) {
    var url = config.rankBaseUrl + '/scores' + '?' + 'examid=' + examid;
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

exports.getAllStudentsByExam = function(exam) {
    return when.promise(function(resolve, reject) {
        //参加本场考试的所有studnetIds，然后得到studentsPromises
    })
};


/**
 * 根据固定的分档规则惊醒区分分数段（因为分数段较多，且学生更多，所以采用二分法去分段而没有采用遍历group的方式--虽然代码可读性更高）
 * @param  {[type]} score [description]
 * @return {[type]}       [description]
 */

/*
测试用例：
var result = {};
_.each(_.range(30), function() {
    var score = _.random(600);
    var key = getLevelByScore(score);
    result[key] = score;
})
//拿到result后可以根据key进行group
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

exports.formatExams = function(exams) {
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

    _.each(examsGroupByEventTime, function(exam, timeKey) {
        //resultOrder是为了建立排序顺序的临时数据结构
        var flag = {key: timeKey, value: moment(exam['event_time']).valueOf() };
        resultOrder.push(flag);
        //按照年级区分，同一个exam下不同年级算作不同的exam
        var papersFromExamGroupByGrade = _.groupBy(exam["[papers]"], function(paper) {
            return paper.grade;
        });
        if(!result[timeKey]) result[timeKey] = [];
        _.each(examsGroupByEventTime, function(papers, gradeKey) {
            var obj = {};
            obj.examName = exam.name + "(年级：" + gradeKey + ")";
            obj.time = moment(exam['event_time']).valueOf();
            obj.eventTime = moment(exam['event_time']).format('ll');
            obj.subjectCount = papers.length;
            obj.fullMark = _.sum(_.map(papers, (item) => item.manfen));
            obj.from = exam.from; //TODO: 这里数据库里只是存储的是数字，但是显示需要的是文字，所以需要有一个map转换

            result[timeKey].push(obj);
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

//其实分析结果只要出一次就可以了，后面考试一旦考完，数据肯定就是不变的，但是出数据的颗粒度需要设计，因为前端会有不同的维度--所以还是需要计算
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


