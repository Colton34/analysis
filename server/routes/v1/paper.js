/*
* @Author: HellMagic
* @Date:   2016-05-30 19:55:06
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-30 20:06:37
*/

'use strict';

var router = require('express').Router();
var papers = require('../../middlewares/papers');

router.get('/:paperId', papers.fetchPaper);

module.exports = router;
