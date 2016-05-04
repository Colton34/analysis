/*
* @Author: HellMagic
* @Date:   2016-04-30 11:19:07
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 19:59:48
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');
var examUitls = require('./util');

//虽然这里写成guide、level等分开的api，但是还是可能尽量把他们作为一次请求(这样能尽量重用本次请求相同的数据)--但是要求响应时间尽量的短
//这些都需要对参数进行验证，通过express validate
//这里没有通过examid走DB，是因为通过peter.get(examid)不能直接get exam实例


/*
方案一：尽量都放在一次ruquest里，通过request来达到缓存的效果
方案二：使用redis
*/


//其实是一个dashboard API就获取了所有孩子的数据，即放在了一个request中

exports.validateExam = function(req, res, next) {
    req.checkQuery('examid', '无效的examids').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());
//因为本身就是对一场考试的分析，所以就只接收一个examid（本身rank-server接收多个examid，所以是examids）
    if(req.query.examid.split(',').length > 1) return next(new errors.ArgumentError('只能接收一个examid', err));
    next();
}

exports.initExam = function(req, res, next) {
    res.result = {};
    examUitls.getExamById(req.query.examid).then(function(exam) {
        req.exam = exam;
        return examUitls.getAllPapersByExam(exam);
    }).then(function(papers) {
        req.papers = papers;
        return examUitls.getSchoolById(req.exam.schoolid);
    }).then(function(school) {
        req.school = school;
        next();
    }).catch(function(err) {
        next(err);
    })
}

//其实这里几乎剩下的都是同步的数据清洗工作，放在前端后端都是一样的代码
exports.guide = function(req, res, next) {
    var result = {
        subjectCount: 0,
        totalProblemCount: 0,
        classCount: 0,
        totalStudentCount: 0
    };

    result.subjectCount = req.exam["[papers]"] ? req.exam["[papers]"].length : 0;
//所有场次考试参加班级的最大数目：
    result.classCount = _.max(_.map(req.exam["[papers]"], function(paper) {
        return _.size(paper.scores);
    }));
//所有场次不同班级所有的人数总和的最大数目
    result.totalStudentCount = _.max(_.map(req.exam["[papers]"], function(paper) {
        return _.reduce(paper.scores, function(sum, classScore, classIndex) {
            return sum += classScore.length;
        }, 0)
    }));
//但是为了获取totalQuestions还是要走获取所有的paper实例，因为rank-server的paper.score只是记录了学生当前科目的总分
    result.totalProblemCount = _.reduce(req.papers, function(sum, paper, index) {
        return sum += (paper["[questions]"] ? paper["[questions]"].length : 0);
    }, 0);
    res.result.guide = result;
    next();
    // res.status(200).json(result);
};

/*
AST:
[<student>] -- 所有参加本次考试的学生，然后可以根据班级进行groupByClass
    {
        classId: [<student>] -->此数组已经按照score进行了排序
    }


 */

// 数组： [{<student info>, scores}]

/*
后面可能还需要以科目为维度，跨班级分析，以及以班级为维度，跨科目分析，应该建立比较通用的数组，然后后面可以根据不同的维度进行groupBy
遍历req.papers
    对paper.matrix进行reduce得到当前学生此科目的分数，通过paper["[students]"]和paper.matrix建立Map： {studentId: <当前科目分数>}
    ...

多个Map相同的key


 */

//这里需要一个科目维度，可能还需要一个班级维度
exports.level = function(req, res, next) {
//每一个学生的总分-->每一个学生每一个门科目(paper)的总分-->每一个学生每门科目中所有题目的得分
    var studentTotalScoreMap = {};
    _.each(req.papers, function(paper) {
        _.each(paper["[students]"], function(student) {
            if(_.isUndefined(studentTotalScoreMap[student.kaohao])) {
                studentTotalScoreMap[student.kaohao] = 0;
            }
            studentTotalScoreMap[student.kaohao] += (student.score ? student.score : 0);
        });
    });
    //按照给的分档标准进行分档
    //这里得到以groupKey为key，value是所有满足分档条件的分数所组成的数组
    var levelScore = _.groupBy(studentTotalScoreMap, function(score, kaohao) {
        if(score >= 600) return 'first';
        if(score >= 520) return 'second';
        if(score >= 400) return 'third';
        return 'other';
    });
    res.result.level = {};
    _.each(levelScore, function(value, key) {
        res.result.level[key] = value.length;
    });
    next();
}

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


exports.dashboard = function(req, res, next) {
    res.status(200).json(res.result);
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

/**
 * 建立学生成绩的分析Map数据结构
 * @param  {[type]} exam   要分析的exam实例
 * @param  {[type]} papers 要分析的此exam下的所有parpers
 * @return Array<{
 *         id: ,
 *         totalScore: ,
 *         class: ,
 *         <paperId>: <score>...
 *
 * }>
 * 比如：
 * [
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
 */

exports.schoolAnalysis = function(req, res, next) {
    try {
        var result = generateStudentScoreInfo(req.exam, req.papers, req.school);
        res.status(200).json(result);
    } catch (e) {
        next(new errors.Error('schoolAnalysis 同步错误', e));
    }
}


//其实分析结果只要出一次就可以了，后面考试一旦考完，数据肯定就是不变的，但是出数据的颗粒度需要设计，因为前端会有不同的维度--所以还是需要计算
function generateStudentScoreInfo(exam, papers, school) {
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

