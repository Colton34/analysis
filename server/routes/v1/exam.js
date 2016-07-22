/*
 * @Author: HellMagic
 * @Date:   2016-04-30 11:14:17
 * @Last Modified by:   HellMagic
 * @Last Modified time: 2016-07-21 20:55:35
 */

'use strict';

var router = require('express').Router();

var peterHFS = require('peter').getManager('hfs');

var when = require('when');
var errors = require('common-errors');

var auth = require('auth');
var exam = require('exam');


//因为在express config中对该保护的路由做了verify（验证）所以就免去了在具体路由里重复的添加（TODO：但是现在权限控制还没有添加）
router.get('/home', exam.home); //TODO:自定义分析的过滤要区分是否是公开的
//TODO: dashboard的重构
router.get('/dashboard', exam.validateExam, exam.initExam, exam.dashboard);
//TODO: 自定义分析对应的权限数据：
    //是否公开，不公开，则只有自己能看到，没有限制
            //公开，自己是“校领导”--没有任何限制，别人只有对应到相应的权限才能看到
router.get('/custom/dashboard', exam.customDashboard);

//校领导/年级主任（对应此年级的--这个应该在home那边已经过滤了，所以如果他能点击进来到dashboard，说明年级是匹配的）-- 数据不用做任何修改
router.get('/school/analysis',  exam.validateExam, exam.initExam, exam.schoolAnalysis);
//TODO: 自定义分析的校级报告权限
router.get('/custom/school/analysis', exam.customSchoolAnalysis);

//所有角色都能看到排行榜。排行榜需要区分
router.get('/rank/report', exam.validateExam, exam.rankReport);
router.get('/custom/rank/report', exam.customRankReport);
//TODO:
// router.get('/custom/rank/report', exam.customRankReport);


//TODO:坑！自定义分析获取考试列表那里会不会有问题--那里即显示exam又显示此exam下所有的paper--这个是要加权限的！！！
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
