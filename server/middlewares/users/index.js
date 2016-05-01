/*
* @Author: liucong
* @Date:   2016-03-31 15:13:53
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-30 12:14:52
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;

exports.getMe = function(req, res, next) {
    res.status(200).send('ok');
};
