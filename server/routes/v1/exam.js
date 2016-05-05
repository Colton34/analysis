/*
* @Author: HellMagic
* @Date:   2016-04-30 11:14:17
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-05 14:27:33
*/

'use strict';

//TODO: auth后面统一加，方便测试

var router = require('express').Router();
var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var errors = require('common-errors');

var auth = require('../../middlewares/auth');
var exam = require('../../middlewares/exam');

router.get('/home', auth.verify, exam.initSchool, exam.home);
router.get('/dashboard', auth.verify, exam.validateExam, exam.initExam, exam.guide, exam.level, exam.dashboard);
router.get('/school/analysis', auth.verify, exam.validateExam, exam.initExam, exam.schoolAnalysis);

module.exports = router;


// router.param('examId', function(req, res, next, id) {
// console.log('examId = ', id+'');
//     peterMgr.get(id, function(err, exam) {
//         if(err) return next(new errors.data.MongoDBError('find exam:'+id+' error', err));
//         req.exam = exam;
//         next();
//     })
// });
