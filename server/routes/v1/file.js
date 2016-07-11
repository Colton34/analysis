/*
* @Author: HellMagic
* @Date:   2016-06-01 14:25:26
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-09 11:38:04
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
router.get('/download/homeguide', dfile.downloadHomeGuide);
//Warning: upload.single('xxx'中的xxx一定要和上传的表单中的filename一致！（不一是file的origianl filename，一定要是上传的filename）
router.post('/import/exam/data', upload.single('importData'), dfile.importExamData);
router.post('/import/exam/student', upload.single('importStudent'), dfile.importExamStudent);
router.post('/export/exam/student', dfile.exportExamStudent);
router.post('/export/rank/report', dfile.exportRankReport);

module.exports = router;
