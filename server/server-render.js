/*
* @Author: HellMagic
* @Date:   2016-05-05 15:00:08
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 17:16:11
*/

'use strict';

var examUitls = require('../../server/middlewares/exam/util');
var when = require('when');
var errors = require('common-errors');
var _ = require('lodash');

export function serverInitHome(params) {
    return examUitls.getSchoolById(params['_user'].schoolId)
        .then(function(school) {
            return examUitls.getExamsBySchool(school);
        }).then(function(exams) {
            try {
                var result = examUitls.formatExams(exams);
                return when.resolve(result);
            } catch(e) {
                return when.reject(new errors.Error('serverInitHome error', e));
            }
        })
    ;
}

export function serverInitDashboard(params) {
    var temp = {}, result = {};
    return when.promise(function(resolve, reject) {
        if(!params.examid || (params.examid.split(',').length > 1)) return reject(new errors.Error('serverInitDashboard invalid examid'));
        return examUitls.getExamById(params.examid);
    }).then(function(exam) {
        temp.exam = exam;
        return examUitls.getAllPapersByExam(exam);
    }).then(function(papers) {
        try {
            result.guide = guide(temp.exam, papers);
            result.level = level(temp.papers);
            return when.resolve(result);
        } catch(e) {
            return when.reject(new errors.Error('serverInitDashboard error', e));
        }
    });
}

// .then(function(papers) { -- 上面好像没必要查school
//         temp.papers = papers;
//         return examUitls.getSchoolById(temp.exam.schoolid);
//     }).then(function(school) {
//         temp.school = school;
//         result.guide = guide(temp.exam, temp.papers);
//         result.level = level(temp.papers);
//         return when.resolve(result);
//     })

export function serverInitSchoolAnalysis(params) {
    var temp = {};
    return when.promise(function(resolve, reject) {
        if(!params.examid || (params.examid.split(',').length > 1)) return reject(new errors.Error('serverInitDashboard invalid examid'));
        return examUitls.getExamById(params.examid);
    }).then(function(exam) {
        temp.exam = exam;
        return examUitls.getAllPapersByExam(exam);
    }).then(function(papers) {
        temp.papers = papers;
        return examUitls.getSchoolById(temp.exam.schoolid);
    }).then(function(school) {
        try {
            var result = examUitls.generateStudentScoreInfo(temp.exam, temp.papers, temp.school);
            return when.resolve(result);
        } catch (e) {
            return when.reject(new errors.Error('serverInitSchoolAnalysis error', e));
        }
    });
}

function guide(exam, papers){
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
    return result;
};

function level(papers) {
    var studentTotalScoreMap = {};
    _.each(papers, function(paper) {
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
    var level = {};
    _.each(levelScore, function(value, key) {
        level[key] = value.length;
    });
    return level;
}
