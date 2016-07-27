/*
* @Author: liucong
* @Date:   2016-03-31 12:09:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-25 17:01:50
*/

'use strict';

var router = require('express').Router();
var auth = require('../../middlewares/auth');

router.get('/me', auth.verify, function(req, res, next) {
    res.status(200).json(req.user);
})

module.exports = router;
