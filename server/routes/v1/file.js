/*
* @Author: HellMagic
* @Date:   2016-06-01 14:25:26
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-02 11:27:21
*/

'use strict';

var router = require('express').Router();
var dfile = require('dfile');

router.post('/download', dfile.downloadFile);
router.get('/get', dfile.getFile);

module.exports = router;
