/*
* @Author: liucong
* @Date:   2016-03-31 12:08:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-09 11:34:15
*/

'use strict';

var path = require('path');
var router = require('express').Router();
var auth = require('auth');

router.get('/logout', function(req, res, next) {
    delete req.user;
    return res.status(200).json({
        "message": "User has been successfully logged out"
    });
});

module.exports = router;

