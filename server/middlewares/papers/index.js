/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-24 20:29:05
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
var KS3client = new KS3(AK, SK, bucket);
var questionPicPrefix = "http://haofenshu.kssws.ks-cdn.com/file/vs/";

var when = require('when');

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

exports.mockFetchLessonQuestionPic = function(req, res, next) {
    //TODO:检查要有两个必要的参数
    res.status(200).json(['http://haofenshu.kssws.ks-cdn.com/file/vs/53595/1.png', 'http://haofenshu.kssws.ks-cdn.com/file/vs/53595/1.png', 'http://haofenshu.kssws.ks-cdn.com/file/vs/53595/1.png']);
}

//保证拿到了exam_objectid
exports.fetchLessonQuestionPic = function(req, res, next) {
    if(!req.body.questionIds || !req.body.examObjectId) return next(new errors.Error('没有questionIds或者examObjectId参数'));

    var fetchQuestionPicPromises = _.map(req.body.questionIds, (questionId) => fetchQuestionPic(questionId, req.body.examObjectId));
    when.all(fetchQuestionPicPromises).then(function(picUrls) {
        res.status(200).json(picUrls);
    }).catch(function(err) {
        next(err);
    })
}

function fetchQuestionPic(questionId, examObjectId) {
    var url = config.analysisServer + '/getOriPicOfQues';
    var postData = {question_id : questionId};
    return when.promise(function(resolve, reject) {
        client.post(url, {body: postData, json: true}, function(err, response, body) {
            if (err) return reject(new errors.URIError('查询analysis server(fetchQuestionPic) Error: ', err));
            resolve(body);
        });
    }).then(function(response) {
        try{
            var picUrl = getPicByExid(examObjectId, response);
            return when.resolve(picUrl);
        } catch(e) {
            return when.reject(errors.Error('转换pic url Error questionId = : ' + questionId, e));
        }
    });
}

//TODO:待测试1.5的试卷
function getPicByExid(examObjectId, response) {
    if(!response.pic) return '';
    if(!examObjectId > 100000) return questionPicPrefix + response.pic;
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
    return KS3client.object.genUrl({
        key : attachmentId,
        expires : expireTime,
        x : x,
        y : y,
        w : w,
        h : h
    });
}

