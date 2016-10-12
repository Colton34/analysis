/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   liucong
* @Last Modified time: 2016-10-12 15:36:32
*/

'use strict';

var errors = require('common-errors');
var client = require('request');
var config = require('../../config/env');

var peterFX = require('peter').getManager('fx');

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
