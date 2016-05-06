/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 14:59:38
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var examUitls = require('./util');
var moment = require('moment');



/**
 * 对API的参数进行校验
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());
    if(req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));

console.log('validateExam 成功！！！');

    next();
}

/**
 * 建立后面所需要的各种元数据（来自DB）
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.initExam = function(req, res, next) {

console.log('initExam...');

    res.result = {};
    examUitls.getExamById(req.query.examid).then(function(exam) {
        req.exam = exam;
        return examUitls.getAllPapersByExam(exam);
    }).then(function(papers) {
        req.papers = papers;
        return examUitls.getSchoolById(req.exam.schoolid);
    }).then(function(school) {
        req.school = school;

console.log('initExam 成功');

        next();
    }).catch(function(err) {
        next(err);
    })
}

exports.initExamTotalScore = function(req, res, next) {
console.log('initExamTotalScore ....');
//要所有学生的top6，那么可以只取每一个班级的top6，这样从这些top6中获取总的top6
    return examUitls.getScoresByExamid(req.query.examid).then(function(allTotalScoreGroupByClssName) {
        try {
            req.topScores = filterTopScores(allTotalScoreGroupByClssName);
            next();
        } catch(e) {
            return when.reject(new errors.Error('initExamTotalScore Format Error', e));
        }
    }).catch(function(err) {
        next(err);
    })
}

function filterTopScores(totalScoreGroup) {
    var topScoresArr = _.chain(totalScoreGroup)
        .map((scores) => _.take(scores, 6))
        .value()
    ;
    topScoresArr = _.concat(...topScoresArr);
    return _.chain(topScoresArr)
        .orderBy(['score'], ['desc'])
        .take(6)
        .value()
    ;
}


/**
 * 获取当前用户所属的学校(req.school)，然后获取此学校所发生的所有考试(exam)，(但是当前Home不需要获取此exam下的所有papers)，
 * 对papers进行分组。但是，很明显，后面的dashboard或者校级分析报告等都需要这么多信息，所以上缓存肯定能节省不少性能--
 * 但是需要规划一下结构体
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.initSchool = function(req, res, next) {

console.log('initSchool....');

    examUitls.getSchoolById(req.user.schoolId)
        .then(function(school) {
            req.school = school;
            return examUitls.getExamsBySchool(req.school);
        }).then(function(exams) {
            req.exams = exams;

console.log('initSchool 成功！！！');

            next();
        }).catch(function(err) {
            next(err);
        })
    ;
}

/**
 * 对Home需要的数据做格式化
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.home = function(req, res, next) {
    res.status(200).json(req.exams);
}

/**
 * 返回dashboard数据结构的结果
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.dashboard = function(req, res, next) {

console.log('dashboard 返回!!!!!!!!!!!');

    res.status(200).json({
        exam: req.exam,
        papers: req.papers,
        school: req.school,
        topScores: req.topScores
    });
}


/**
 * 返回SchoolAnalysis的基本数据结构。不同于Home和Dashboard，因为schoolAnalysis有许多交互改变条件从而改变展示数据的场景，所以
 * 没有直接返回格式化程度高的数据格式
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.schoolAnalysis = function(req, res, next) {
    try {
        var result = examUitls.generateStudentScoreInfo(req.exam, req.papers, req.school);

console.log('schoolAnalysis 返回');

        res.status(200).json(result);
    } catch (e) {
        next(new errors.Error('schoolAnalysis 同步错误', e));
    }
}


/**
 * 对所给学校所发生的所有exam进行分组排序
 * @param  {[type]} exams  此学校所发生过的所有exam
 * @return {[type]}        按照exam发生时间分组并且排序好的，组内部按照exam发生时间进行排序好的数组
 * @InterFaceFormat        [{timeKey: [{examName: xxx, eventTime: xxx, subjectCount: xx, fullMark: xxx, from: xxx}]}]，其中time字段只是为了排序用的
 */


//两个获得的数据一样！！！
exports.testLevel = function(req, res, next) {
    var result = [];
    examUitls.getScoresById(req.query.examid)
        .then(function(scores) {
            _.each(scores, function(value, className) {
                result = _.concat(result, value);
            });

            var levelScore = _.groupBy(result, function(score, index) {
                if(score >= 600) return 'first';
                if(score >= 520) return 'second';
                if(score >= 400) return 'third';
                return 'other';
            });
            res.result.testlevel = {};
            _.each(levelScore, function(value, key) {
                res.result.testlevel[key] = value.length;
            });
            next();
        }).catch(function(err) {
            next(err);
        })
}

/*

DST1:
[
    {
        'a1': {name: 'hellmagic', score: 40, class: 'A2' },
        totalScore: 40,
        '123': {name: '语文', score: 50 }
    },
    {
        'a2': {name: 'liucong', score: 70, class: 'A1' },
        totalScore: 40,
        '456': {name: '数学', score: 56 }
    },
    {
        'a3': {name: 'liujuan', score: 40, class: 'A1' },
        totalScore: 40,
        '789': {name: '语文', score: 70 }
    },
    {
        'a4': {name: 'wangrui', score: 80, class: 'A2' },
        totalScore: 40,
        '789': {name: '数学', score: 35 },
    },
    {
        'a3': {name: '哈哈', score: 1000, class: 'A2' },
        totalScore: 40,
        '789': 70,
        '456': 60,
        '098': 80,
    }
]

DST2：
{
    <paperId> : {name: '', fullMark: 100}
}

DST3:
About Class
{
    'A1': {studentsCount: 100},
    'A2': {studentsCount: 120}
}




 */

/*
总分趋势：
    当前有所有学生的





 */



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

