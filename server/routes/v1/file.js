/*
* @Author: HellMagic
* @Date:   2016-06-01 14:25:26
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-02 14:46:35
*/

'use strict';

var router = require('express').Router();
var dfile = require('dfile');

router.post('/render', dfile.downloadFile);
router.get('/download', dfile.getFile);
router.delete('/rm', dfile.rmFile);

module.exports = router;
