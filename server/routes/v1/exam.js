/*
 * @Author: HellMagic
 * @Date:   2016-04-30 11:14:17
 * @Last Modified by:   HellMagic
 * @Last Modified time: 2016-07-09 11:37:13
 */

'use strict';

var when = require('when');
var errors = require('common-errors');
var router = require('express').Router();

var auth = require('auth');
var exam = require('exam');
var peterHFS = require('peter').getManager('hfs');

router.get('/home', exam.home);

router.get('/dashboard', exam.validateExam, exam.initExam, exam.dashboard);
router.get('/custom/dashboard', exam.customDashboard);

router.get('/rank/report', exam.validateExam, exam.rankReport);
router.get('/custom/rank/report', exam.customRankReport);

router.get('/school/analysis',  exam.validateExam, exam.initExam, exam.schoolAnalysis);
router.get('/custom/school/analysis', exam.customSchoolAnalysis);

router.post('/custom/analysis', exam.createCustomAnalysis);
router.put('/custom/analysis', exam.inValidCustomAnalysis);

module.exports = router;
