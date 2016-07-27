/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-25 17:08:38
*/

'use strict';

var errors = require('common-errors');

var peterHFS = require('peter').getManager('hfs');
var peterFX = require('peter').getManager('fx');

exports.fetchPaper = function (req, res, next) {
    req.checkParams('paperId', '无效的paperId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    peterHFS.get(req.params.paperId, function(err, paper) {
        if(err) return next(new errors.data.MongoDBError(': '+req.params.paperId+' Error', err));
        res.status(200).json({
            id: paper._id,
            // answers: paper.answers, //TODO: 设计关于answers的存储
            x: paper['[questions]'],
            y: paper['[students]'],
            m: paper['matrix']
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
