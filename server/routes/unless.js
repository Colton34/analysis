/*
* @Author: HellMagic
* @Date:   2016-05-05 11:51:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-09 11:30:36
*/

'use strict';

var router = require('express').Router();
var auth = require('auth');
var _ = require('lodash');

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', auth.authenticate, function(req, res, next) {
    var options = (_.includes(req.hostname, 'yunxiao')) ? { domain: '.yunxiao.com'} : {};
    res.cookie('authorization', req.user.token, options);
    res.status(200).json(req.user);
});

module.exports = router;
