/*
* @Author: HellMagic
* @Date:   2016-04-30 11:14:17
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-01 13:00:58
*/

'use strict';

//TODO: auth后面统一加，方便测试

var router = require('express').Router();
var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var errors = require('common-errors');

var auth = require('../../middlewares/auth');
var exam = require('../../middlewares/exam');

/*
    req.exam = {
        _id: '000000000000000000000167'
    };


 */

//因为可能所有关于exam的都走rank-server，所以这里就先不主动获取exam实例了
router.param('examId', function(req, res, next, id) {
console.log('examId = ', id+'');
    peterMgr.get(id, function(err, exam) {
        if(err) return next(new errors.data.MongoDBError('find exam:'+id+' error', err));
        req.exam = exam;
        next();
    })
});

router.get('/guide', exam.guide);

router.get('/test', exam.test);

module.exports = router;
