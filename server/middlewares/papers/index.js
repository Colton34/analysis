/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-13 20:14:21
*/

'use strict';

var peterHFS = require('peter').getManager('hfs');

var errors = require('common-errors');

exports.fetchPaper = function (req, res, next) {
    req.checkParams('paperId', '无效的paperId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());
    //从数据库中找到此paper，然后返回
    peterHFS.get(req.params.paperId, function(err, paper) {
        if(err) return next(new errors.MongoDBError('find paper: '+req.params.paperId+' Error', err));
        console.log('paper.subject = ', paper.subject);
        res.status(200).json({
            id: paper._id,
            pid: paper.id,  //这个值也用不到了，可以删除--因为是插入，所以pid是生成的，但是这里又没有@Paper，所以这里是mock的id
            answers: paper.answers, //TODO: 设计关于answers的存储
            x: paper['[questions]'],
            y: paper['[students]'],
            m: paper['matrix']
        });
    });
}
