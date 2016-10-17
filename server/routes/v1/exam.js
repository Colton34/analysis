/*
 * @Author: HellMagic
 * @Date:   2016-04-30 11:14:17
 * @Last Modified by:   HellMagic
 * @Last Modified time: 2016-10-17 11:46:25
 */

'use strict';

var when = require('when');
var errors = require('common-errors');
var router = require('express').Router();

var auth = require('auth');
var exam = require('exam');

router.get('/home', exam.home);
router.get('/dashboard', exam.validateExam, exam.initExam, exam.dashboard);
router.get('/rank/report', exam.validateExam, exam.initExam, exam.rankReport);
router.get('/school/analysis',  exam.validateExam, exam.initExam, exam.schoolAnalysis);
router.post('/custom/analysis', exam.createCustomAnalysis);
router.put('/custom/analysis', exam.inValidCustomAnalysis);
router.put('/levels', exam.updateExamBaseline);

router.get('/equivalent/list', exam.listEquivalentScoreInfo);
router.post('/equivalent/score', exam.setEquivalentScoreInfo);
router.get('/zouban', exam.zoubanDS);

module.exports = router;
