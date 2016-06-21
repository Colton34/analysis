/*
* @Author: HellMagic
* @Date:   2016-06-01 14:25:26
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-21 12:57:04
*/

'use strict';

var router = require('express').Router();
var dfile = require('dfile');

var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 10485760,
        files: 1
    }
});

router.post('/render/school/report', dfile.renderSchoolReport);
router.get('/download/school/report', dfile.downloadSchoolReport);
router.delete('/rm/school/report', dfile.rmSchoolReport);

router.get('/download/tpl', dfile.downloadExamTmp);
router.get('/download/guide', dfile.downloadExamGuide);
//注意 upload.single('xxx')中的xxx一定要和上传的表单中的filename一致！！！（不一定是file的origianl filename，一定要是上传的
//filename）
router.post('/import/exam/data', upload.single('importData'), dfile.importExamData);
router.post('/import/exam/student', upload.single('importStudent'), dfile.importExamStudent);
router.post('/export/exam/student', dfile.exportExamStudent);

module.exports = router;
