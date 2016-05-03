/*
* @Author: HellMagic
* @Date:   2016-04-30 13:32:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-03 14:46:04
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var client = require('request');

var config = require('../../config/env');

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

console.log('url = ', url);

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

exports.getExamClass = function(exam) {
    //通过exam.schoolid获取school实例，然后school.grades->classes reduce出来
    return when.promise(function(resolve, reject) {
        peterMgr.get(exam.schoolid, function(err, school) {
            if(err) return reject(new errors.data.MongoDBError('find school:'+exam.schoolid+' error', err));
            var result = _.reduce(school.grades, function(sum, grade, index) {
                return sum += (grade.classes ? grade.classes.length : 0);
            }, 0);
            resolve(result);
        });
    });
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

exports.getSchoolById = function(schoolid) {
    return when.promise(function(resolve, reject) {
        peterMgr.get(schoolid, function(err, school) {
            if(err) return rejct(new errors.data.MongoDBError('find school:' + schoolid+' error: ', err));
            resolve(school);
        });
    });
};


