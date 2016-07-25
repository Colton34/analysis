/*
* @Author: liucong
* @Date:   2016-03-31 12:09:30
* @Last Modified by:   liucong
* @Last Modified time: 2016-07-25 11:23:36
*/

'use strict';

var router = require('express').Router();
var users = require('users');
var auth = require('../../middlewares/auth');

// router.param('userId', function(req, res, next, id) {
//     req.user = {
//         id: id
//     };
//     next();
// });

// router.get('/:userId', function(req, res, next) {
//     res.status(200).send('user: ', req.user);
// });

router.get('/me', auth.verify, function(req, res, next) {
    res.status(200).json(req.user);
})

module.exports = router;
