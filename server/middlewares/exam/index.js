/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-01 13:33:35
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var examUitls = require('./util');
var client = require('request');

var config = require('../../config/env');
var examPath = '/exams';

//虽然这里写成guide、level等分开的api，但是还是可能尽量把他们作为一次请求(这样能尽量重用本次请求相同的数据)--但是要求响应时间尽量的短
//这些都需要对参数进行验证，通过express validate
//这里没有通过examid走DB，是因为通过peter.get(examid)不能直接get exam实例
exports.guide = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

//因为本身就是对一场考试的分析，所以就只接收一个examid（本身rank-server接收多个examid，所以是examids）
    if(req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err))

    var url = config.rankBaseUrl + examPath + '?' + 'examids=' + req.query.examid;
    var result = {
        subjectCount: 0,
        totalProblemCount: 0,
        classCount: 0,
        totalStudentCount: 0
    };
//因为支持一次查询多场exam，所以req.query,examids是复数--多个examid通过逗号隔开，返回的结果是个Map，其中key是examid，value是exam实体。
    when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('查询rank server失败', err));
            resolve(JSON.parse(body)[req.query.examid]);
        })
    }).then(function(data) {
//data是一个以examid为key，exam实例为vlaue的Map
        result.subjectCount = data["[papers]"] ? data["[papers]"].length : 0;
//所有场次考试参加班级的最大数目：
        result.classCount = _.max(_.map(data["[papers]"], function(paper) {
            return _.size(paper.scores);
        }));
//所有场次不同班级所有的人数总和的最大数目
        result.totalStudentCount = _.max(_.map(data["[papers]"], function(paper) {
            return _.reduce(paper.scores, function(sum, classScore, classIndex) {
                return sum += classScore.length;
            }, 0)
        }));
//但是为了获取totalQuestions还是要走获取所有的paper实例，因为rank-server的paper.score只是记录了学生当前科目的总分
        var findPapersPromises = _.map(data["[papers]"], function(pobj) {
            return when.promise(function(resolve, reject) {
                peterMgr.get(pobj.paper, function(err, paper) {
                    if(err) return reject(new errors.data.MongoDBError('find paper:'+pid+' error', err));
                    resolve(paper);
                });
            });
        });
        return when.all(findPapersPromises);
    }).then(function(papers) {
        result.totalProblemCount = _.reduce(papers, function(sum, paper, index) {
            return sum += (paper["[questions]"] ? paper["[questions]"].length : 0);
        }, 0);

        res.status(200).json(result);
    }).catch(function(err) {
        next(err);
    });
};

/*
AST:
[<student>] -- 所有参加本次考试的学生，然后可以根据班级进行groupByClass
    {
        classId: [<student>] -->此数组已经按照score进行了排序
    }


 */


exports.level = function(req, res, next) {

}

exports.test = function(req, res, next) {
    res.status(200).send('test over');
    // peterMgr.get("5717ecc90000052174de5f7c", function(err, paper) {
    //     if(err) {
    //         console.log('paper find err: ', err);
    //         res.status(500).send('paper find err');
    //     }
    //     console.log('paper.students.length = ', paper["[students]"].length);
    //     console.log('paper.students.questions = ', paper["[questions]"].length);
    //     res.status(200).send('ok');
    // })
}



//     req.checkQuery('examid', '无效的examids').notEmpty();
//     if(req.validationErrors()) return next(req.validationErrors());

//     //因为本身就是对一场考试的分析，所以就只接收一个examid（本身rank-server接收多个examid，所以是examids）
//     if(req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err))

//     var url = config.rankBaseUrl + examPath + '?' + 'examids=' + req.query.examid;
//     var result = {
//         subjectCount: 0,
//         totalProblemCount: 0,
//         classCount: 0,
//         totalStudentCount: 0
//     };
//     //因为支持一次查询多场exam，所以req.query,examids是复数--多个examid通过逗号隔开，返回的结果是个Map，其中key是examid，value是exam
//     //实体。
//     when.promise(function(resolve, reject) {
//         client.get(url, {}, function(err, res, body) {
//             if(err) return reject(new errors.URIError('查询rank server失败', err));
//             resolve(JSON.parse(body)[req.query.examid]);
//         })
//     }).then(function(data) {
//         //data是一个以examid为key，exam实例为vlaue的Map
//         // console.log('data.name = ', data.name);
//         result.subjectCount = data["[papers]"] ? data["[papers]"].length : 0;

// console.log('data["[papers]"].length = ', data["[papers]"].length);

//         var findPapersPromises = _.map(data["[papers]"], function(pobj) {
//             return when.promise(function(resolve, reject) {

// console.log('paper = ', pobj.paper);

//                 peterMgr.get(pobj.paper, function(err, paper) {
//                     if(err) return reject(new errors.data.MongoDBError('find paper:'+pid+' error', err));
//                     resolve(paper);
//                 });
//             });
//         });
//         return when.all(findPapersPromises);
//     }).then(function(papers) {

//         res.status(200).send('ok');
//     })
//     .catch(function(err) {
//         next(err);
//     });
    // var result = {
    //     totalProblemCount: 0,
    //     totalStudentCount: 0
    // };
    // result.subjectCount = req.exam.papers ? req.exam.papers.length : 0;
    // var findPapersPromises = _.map(req.exam.papers, function(pid) {
    //     return when.promise(function(resolve, reject) {
    //         peterMgr.find(pid, function(err, paper) {
    //             if(err) return reject(new errors.data.MongoDBError('find paper:'+pid+' error', err));
    //             resolve(paper);
    //         });
    //     });
    // });
    // //这里有遍历查找
    // when.all(findPapersPromises).then(function(papers) {
    //     var examStduentIds = [];
    //     _.each(papers, function(paper) {
    //         result.totalProblemCount += (paper.questions ? paper.questions.length : 0);
    //         //总学生数目：参加各个考试的学生的并集 （缺考人数：班级里所有学生人数-参加此场考试的学生人数）
    //         // result.totalStudentCount += (paper.students ? paper.students.length || 0);
    //         var paperStudentIds = _.map(paper.students, function(student) {
    //             return student._id;
    //         });
    //         examStduentIds = _.union(examStduentIds, paperStudentIds);
    //     });
    //     result.totalStudentCount = examStduentIds.length; //这里拿到了参加此场考试(exam)的所有学生id
    //     return examUitls.getExamClass();
    // }).then(function(classCount) {
    //     result.classCount = classCount;
    //     res.status(200).json(result);
    // })
    // .catch(function(err) {
    //     next(err);
    // });

