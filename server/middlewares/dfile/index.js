/*
* @Author: HellMagic
* @Date:   2016-06-01 14:27:51
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-02 11:59:35
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

//1.已经通过auth。那么就应该有req.user，也会有req.user.token。通过query中获取到url
//2.调用phantomjs执行脚本，然后输出

console.log('downloadFile url ============ ', req.query.url);

    req.checkBody('url', '无效的url').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    var tmpobj = tmp.fileSync({ postfix: '.jpg', dir: tempFileDir });

    var childArgs = [
        path.join(__dirname, '../..', 'lib', 'phantom-script.js'),
        req.body.url,
        req.user.token,
        path.join(tmpobj.name)
    ];


console.log('req.body.url = ', req.body.url);

    childProcess.execFile(phantom.path, childArgs, function(err, stdout, stderr) {
        //设定了 options中'encoding': 'buffer'则返回的stdout就是Buffer对象，而不是decode后的String值
        if(err) next(new errors.Error('convert html to file error', err));


console.log('==============================================');

console.log('stdout = ', stdout);

console.log('==============================================');


        res.status(200).send(stdout);

        // res.setHeader('Content-disposition', 'attachment; filename=报告.png');
        // res.setHeader('Content-type', 'image/png');
    });
}

exports.getFile = function(req, res, next) {
    var stat = fs.statSync(req.query.filename);
    res.status(200).download(req.query.filename, '我叫MT.jpg');
}

exports.deleteFile = function(req, res, next) {
    //下载成功后删除此临时文件
}


// function createTempFile(extension, contents, callback)
// {
//     var needsTempFile = false;

//     try {
//         if (fs.lstatSync(path.resolve(contents)).isFile()) {
//             debug('Found file "%s"', contents);
//             callback(null, path.resolve(contents));
//         } else {
//             needsTempFile = true;
//         }
//     } catch (err) {
//         needsTempFile = true;
//     }

//     if (needsTempFile) {
//         debug('Creating temp %s...', extension);
//         tmp.file({postfix: extension}, function (err, tmpPath, tmpFd) {
//             if (err) { callback(err, null); }

//             var buffer = new Buffer(contents);

//             fs.write(tmpFd, buffer, 0, buffer.length, null, function(err, written, buffer) {
//                 if (err) { debug('Could not create temp file! %s', err); }

//                 fs.close(tmpFd);
//                 callback(null, tmpPath);
//             });
//         });
//     }
// }
