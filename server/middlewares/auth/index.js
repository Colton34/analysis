/*
* @Author: liucong
* @Date:   2016-03-31 11:59:40
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-09 11:18:35
*/

'use strict';

var _ = require("lodash");
var when = require('when');
var path = require('path');
var util = require('util');
var bcrypt = require('bcryptjs');
var errors = require('common-errors');
var Router = require("express").Router;
var ObjectId = require('mongodb').ObjectId;
var jsonwebtoken = require("jsonwebtoken");

var authUitls = require('./util');
var config = require('../../config/env');
var peterHFS = require('peter').getManager('hfs');

//登录服务来自阅卷，并且分两个源查找验证
exports.authenticate = function(req, res, next) {
    req.checkBody('value', '无效的value').notEmpty();
    req.checkBody('password', '无效的password').notEmpty();
    if(req.validationErrors()) return next(new errors.HttpStatusError(401, {errorCode: 1, message: '无效的用户名或密码'}));

    var value = req.body.value.toLowerCase();
    var password = req.body.password;

    authUitls.getUserInfo(value).then(function(user) {
        if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 2, message: '密码不正确'}));
        if(!user) return authUitls.getUserInfo2(value, password);

        return when.resolve(user);
    }).then(function(user) {
        if(!user) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '用户不存在'}));
        if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '密码不正确'}));
        delete user.pwd;

        var token = jsonwebtoken.sign({ user: user }, config.secret);
        user.token = token;
        req.user = user;

        next();
    }).catch(function(err) {
        next(err);
    })
}

//对所有受保护的资源进行auth验证
exports.verify = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.authorization;
    if(!token) return next(new errors.HttpStatusError(400, '没有令牌，拒绝访问，请登录~'));

    when.promise(function(resolve, reject) {
        jsonwebtoken.verify(token, config.secret, function (err, decode) {
            if (err) return reject(new errors.HttpStatusError(401, {errorCode: 3, message: '无效的令牌，拒绝访问，请登录~'}));
            resolve(decode.user);
        });
    }).then(function(user) {
        req.user = user;
        req.user.token = token;
        next();
    }).catch(function(err) {;
        next(err);
    });
};
