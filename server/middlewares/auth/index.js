/*
* @Author: liucong
* @Date:   2016-03-31 11:59:40
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-20 10:16:00
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

/**
 * 登录的验证。验证的逻辑调用的是阅卷通用的登录接口--包含两部分：先尝试查找1.5，没有找到再
 * 尝试查找2.0。
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}
req.user 接口：
{
    areaId: xxx,
    id: xxx,
    name: xxx,
    permissionType: xxx,
    realName: xxx,
    roleName: xxx,
    schoolId: xxx,
    schoolName: xxx,
    token: xxx
}
 */
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

console.log(req.user);

        next();
    }).catch(function(err) {
        next(err);
    })
}

/**
 * 对所有受保护的API进行校验。验证通过将有效的token写入response从而被client持有。
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
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
