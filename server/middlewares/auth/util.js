/*
* @Author: HellMagic
* @Date:   2016-05-03 19:03:53
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-14 12:22:15
*/

'use strict';

var when = require('when');
var _ = require('lodash');
var client = require('request');
var util = require('util');
var config = require('../../config/env');

var qs = require('querystring');
var jwt = require('jsonwebtoken');
var errors = require('common-errors');

var yjServer = config.yjServer;
var yj2Server = config.yj2Server;
var casServer = config.casServer;

var apiUser = `${yjServer}/api/user/fenxi_login.do`;
var apiUser2 = `${yj2Server}/anno/user/profile`;
var apiCasValid = `${casServer}/passport/fx/login`;

var apiAccessRange = `${yjServer}/api/user/fenxi_range.do`;
var apiAccessRange2 = `${yj2Server}/anno/getUserAccess`;

var tokenKey = new Buffer('462fd506cf7c463caa4bdfa94fad5ea3', 'base64');

exports.getUserInfo = function(name) {
    var url = buildGetUrl(apiUser, {username : name});

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('请求登录用户接口I失败', err));
            if(res.statusCode != 200) return resolve(null);

            body = JSON.parse(body);
            if(body.code != 1) return resolve(null);
            resolve(body.object);
        });
    });
}


exports.getUserInfo2 = function(name, pwd){
    var url = buildGetUrl(apiCasValid, {username : name, password : pwd});
    return getUserId(url).then(function(userId) {
        if(!userId) return when.resolve(null);
        var token = jwt.sign({}, tokenKey, { algorithm: 'HS512', jwtid : userId, noTimestamp : false});
        return getUserProfile(token, userId);
    }).then(function(data) {
        if(!data) return when.resolve(null);

        var result = {};
        result.name = name;
        result.pwd = pwd;
        result.id = +data.userId;
        result.realName = data.name;
        result.schoolId = +data.schoolId;
        result.schoolName = data.schoolName;
        return when.resolve(result);
    });
}

exports.fetchUserAuthorization = function(userId) {
    var url = buildGetUrl(apiAccessRange, {userid: userId});
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('获取用户权限I失败', err));
            if(res.statusCode != 200) return reject(new errors.URIError('获取用户权限I不成功'));
            body = body.replace(new RegExp('""', 'g'), 'null');
            body = JSON.parse(body);

            if(body.code != 1) return reject(new errors.Error('获取用户权限I Error: body.code != 1'));
            // resolve(body.object);
            return resolve(parseGrade(body.object));
        })
    })
}

exports.fetchUserAuthorization2 = function(userId) {
    return when.promise(function(resolve, reject) {
        client.post(apiAccessRange2, {json: {userId: ''+userId}}, function(err, res, body) {
            if(err) return reject(new errors.URIError('获取用户权限II失败', err));
            if(res.statusCode != 200) return reject(new errors.URIError('获取用户权限II不成功'));
            body = JSON.stringify(body).replace(new RegExp('""', 'g'), 'null');
            body = JSON.parse(body);
            if(body.code != 0) return reject(new errors.Error('获取用户权限II Error: body.code != 0'));
            // resolve(body.data);
            return resolve(parseGrade(body.data));
        })
    })
}


function buildGetUrl(apiUrl, params){
    return `${apiUrl}?` + qs.stringify(params);
}


function getUserProfile(token, userId) {
    var url = buildGetUrl(apiUser2, {token: token});
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('请求登录用户接口II，getUserProfile失败', err));
            if(res.statusCode != 200) return reject(new errors.Error('请求登录用户接口II不成功'));
            body = JSON.parse(body);
            if(body.code != 0) return reject(new errors.Error('请求登录用户接口II Error: body.code != 0'));
            body.data.userId = userId;
            resolve(body.data);
        });
    });
}

function getUserId(url) {
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if(err) return reject(new errors.URIError('请求登录用户接口II失败', err));
            if(res.statusCode != 200) return reject(new errors.Error('请求登录用户接口II不成功'));
            body = JSON.parse(body);
            if(!(body.code == 1 && body.msg == 'ok')) return reject(new errors.Error('请求登录用户接口II Error: body.code != 1 or body.msg != ok'));
            resolve(body.userId);
        });
    })
}

function parseGrade(auth){
    if(auth){
        _.each(auth, function(item){
            item.grade = getGradeName(item.grade);
        });
    }

    return auth;
}

function getGradeName(grade){
    if(grade == null || grade == ''){
        return null;
    }

    if(_.includes(grade, "小学一年级")){
        return "一年级";
    }else if(_.includes(grade, "小学二年级")){
        return "二年级";
    }else if(_.includes(grade, "小学三年级")){
        return "三年级";
    }else if(_.includes(grade, "小学四年级")){
        return "四年级";
    }else if(_.includes(grade, "小学五年级")){
        return "五年级";
    }else if(_.includes(grade, "小学六年级")){
        return "六年级";
    }else if(_.includes(grade, "初中一年级")){
        return "初一";
    }else if(_.includes(grade, "初中二年级")){
        return "初二";
    }else if(_.includes(grade, "初中三年级")){
        return "初三";
    }else if(_.includes(grade, "初中四年级")){
        return "初四";
    }else if(_.includes(grade, "高中一年级")){
        return "高一";
    }else if(_.includes(grade, "高中二年级")){
        return "高二";
    }else if(_.includes(grade, "高中三年级")){
        return "高三";
    }else {
        return grade;
    }
}
