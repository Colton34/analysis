/*
* @Author: HellMagic
* @Date:   2016-06-01 14:27:51
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-02 15:01:22
*/

'use strict';

var errors = require('common-errors');
var childProcess = require('child_process');
var phantom = require('phantomjs-prebuilt');
var path = require('path');
var fs = require('fs');
var tmp = require('tmp');

var tempFileDir = path.join(__dirname, '../../..', 'tempFiles');

exports.downloadFile = function(req, res, next) {
    req.checkBody('url', '无效的url').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    var tmpobj = tmp.fileSync({ postfix: '.pdf', dir: tempFileDir });

    var childArgs = [
        path.join(__dirname, '../..', 'lib', 'phantom-script.js'),
        req.body.url,
        req.user.token,
        path.join(tmpobj.name)
    ];

    childProcess.execFile(phantom.path, childArgs, function(err, stdout, stderr) {
        if(err) return next(new errors.Error('convert html to file error', err));
        res.status(200).send(stdout);
    });
}

exports.getFile = function(req, res, next) {
    var stat = fs.statSync(req.query.filename);
    res.status(200).download(req.query.filename, '校级报告.pdf');
}

exports.rmFile = function(req, res, next) {
    //下载成功后删除此临时文件
    req.checkQuery('filename', '无效的filename').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    fs.unlink(req.query.filename, function(err) {
        if(err) return next(new errors.Error('删除文件错误', err));
        res.status(200).end();
    });
}
