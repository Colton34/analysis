/*
* @Author: HellMagic
* @Date:   2016-05-30 19:57:47
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 14:13:49
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var errors = require('common-errors');

exports.fetchPaper = function (req, res, next) {
    req.checkQuery('paperId', '无效的paperId').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());
    //从数据库中找到此paper，然后返回
    peterMgr.get(req.params.paperId, function(err, paper) {
        if(err) return next(new errors.MongoDBError('find paper: '+req.params.paperId+' Error', err));
        console.log('paper.subject = ', paper.subject);
        res.status(200).json({
            id: paper._id,
            x: paper['[questions]'],
            y: paper['[students]'],
            m: paper['matrix']
        });
    });
}
