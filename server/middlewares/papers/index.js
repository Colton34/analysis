/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-24 16:12:16
*/

'use strict';

var errors = require('common-errors');
var client = require('request');
var config = require('../../config/env');

var peterFX = require('peter').getManager('fx');

var KS3 = require("ks3");
var AK = "LUKEBCQ32C6AVUK2TCHA";
var SK = "5Qixn339yiXUBtiP67XPCB14TRHnoqq8cVPWVdM9";
var bucket = 'kaoshi2';
var expireTime = 100;
var client = new KS3(AK, SK, bucket);

exports.fetchPaper = function (req, res, next) {
    req.checkParams('paperId', '无效的paperId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    var url = config.analysisServer + '/paper?p=' + req.params.paperId;
    client.get(url, {}, function(err, response, body) {
        if(err) return next(new errors.URIError('查询analysis server(fetchPaper) Error: ', err));
        var data = JSON.parse(body);
        if(data.error) return next(new errors.Error('查询analysis server(fetchPaper)失败，p = ', req.params.paperId));
        res.status(200).json({
            id: data._id,
            x: data['[questions]'],
            y: data['[students]'],
            m: data.matrix
        });
    });
}

exports.fetchCustomPaper = function(req, res, next) {
    req.checkParams('paperId', '无效的paperId').notEmpty();
    req.checkParams('examId', '无效的examId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    peterFX.get(req.params.examId, function(err, exam) {
        if(err || !exam) return next(new errors.data.MongoDBError('[fetchCustomPaper] Error(examId: ' + req.params.examId+'  paperId: ' + req.params.paperId + '  )', err));
        var targetPaper = _.find(exam['[papersInfo]'], (paperObj) => paperObj.paper == req.params.paperId);
        if(!targetPaper) return next(new errros.data.Error('[fetchCustomPaper] Error: Not found target custom paper(examId: ' + req.params.examId+'  paperId: ' + req.params.paperId+' )'));
        var result = {id: targetPaper.paper, pid: targetPaper.id, x: targetPaper['[questions]'], y: targetPaper['[students]'], m: targetPaper['matrix']};
        res.status(200).json(result);
    });
}

exports.mockFetchQuestionPic = function(req, res, next) {
    //TODO:检查要有两个必要的参数
    res.status(200).json({
        picUrl: 'http://haofenshu.kssws.ks-cdn.com/file/vs/53595/1.png'
    });
}

//保证拿到了exam_objectid
exports.fetchQuestionPic = function(req, res, next) {
    req.checkQuery('question_id', '没有question_id').notEmpty();
    req.checkQuery('exam_objectid', '没有exam_objectid').notEmpty();
    if (req.validationErrors()) return next(req.validationErrors());
    var url = config.analysisServer + '/getOriPicOfQues';

console.log('url = ', url);

    var postData = {question_id : req.query.question_id};
    when.promise(function(resolve, reject) {
        client.post(url, {body: postData, json: true}, function(err, response, body) {
            if (err) return reject(new errors.URIError('查询analysis server(fetchQuestionPic) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(fetchQuestionPic)失败'));
            resolve(body);
        });
    }).then(function(response) {
        try{
            var picUrl = getPicByExid(req.query.exam_objectid, response);
            res.status(200).json({ picUrl: picUrl });
        } catch(e) {
            next(errors.data.Error('转换pic url Error : ', e));
        }
    }).catch(function(err) {
        next(err)
    })
}

function getPicByExid(examObjectId, response) {
console.log('response ===========  ', JSON.stringify(response));
    if(!(examObjectId > 100000 && response.pic)) return response;
    var picInfo = response.pic;
    var tempParams = picInfo.split(':');
    var attachmentId = tempParams[0];

    tempParams = tempParams[1].split(';');
    tempParams = tempParams[0].split(',');
    var picParams = [];
    tempParams.forEach(function(v) {
        picParams.push(parseFloat(v));
    });
    var realUrl = genScaleKS3Url(attachmentId, picParams[0], picParams[1], picParams[2], picParams[3]);
    return realUrl;
}

function genScaleKS3Url(attachmentId, x, y, w, h) {
    return client.object.genUrl({
        key : attachmentId,
        expires : expireTime,
        x : x,
        y : y,
        w : w,
        h : h
    });
}

