/*
* @Author: HellMagic
* @Date:   2016-05-30 19:55:06
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-20 19:23:24
*/

'use strict';

var router = require('express').Router();
var papers = require('../../middlewares/papers');

router.get('/:paperId', papers.fetchPaper);
router.get('/:paperId/exam/:examId', papers.fetchCustomPaper);

module.exports = router;
