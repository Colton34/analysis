/*
* @Author: liucong
* @Date:   2016-03-31 12:08:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-01 14:27:20
*/

'use strict';

var express = require('express');
var rootRouter = express.Router();

rootRouter.use('/auth', require('./auth'));
rootRouter.use('/user', require('./user'));
rootRouter.use('/exam', require('./exam'));
rootRouter.use('/papers', require('./paper'));
rootRouter.use('/file', require('./file'));

module.exports = function(app) {
    app.use('/api/v1', rootRouter);
}
