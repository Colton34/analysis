/*
 * @Author: HellMagic
 * @Date:   2016-04-30 11:14:17
 * @Last Modified by:   HellMagic
 * @Last Modified time: 2016-06-15 21:11:50
 */

'use strict';

var router = require('express').Router();

var peterHFS = require('peter').getManager('hfs');

var when = require('when');
var errors = require('common-errors');

var auth = require('auth');
var exam = require('exam');


//因为在express config中对该保护的路由做了verify（验证）所以就免去了在具体路由里重复的添加（TODO：但是现在权限控制还没有添加）
router.get('/home', exam.home);
//TODO: dashboard的重构
router.get('/dashboard', exam.validateExam, exam.initExam, exam.dashboard);
router.get('/custom/dashboard', exam.customDashboard);

router.get('/school/analysis',  exam.validateExam, exam.initExam, exam.schoolAnalysis);
router.get('/custom/school/analysis', exam.customSchoolAnalysis);

router.get('/rank/report', exam.validateExam, exam.initExam, exam.rankReport);

router.post('/custom/analysis', exam.createCustomAnalysis);
router.put('/custom/analysis', exam.inValidCustomAnalysis);

module.exports = router;


// router.param('examId', function(req, res, next, id) {
// console.log('examId = ', id+'');
//     peterHFS.get(id, function(err, exam) {
//         if(err) return next(new errors.data.MongoDBError('find exam:'+id+' error', err));
//         req.exam = exam;
//         next();
//     })
// });
