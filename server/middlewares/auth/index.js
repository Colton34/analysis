/*
* @Author: liucong
* @Date:   2016-03-31 11:59:40
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-12 12:13:56
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

var adminPrivilege = {grade: null, subject: null, group: null};

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
        // if(user) console.log('pwd - ', user.pwd);
        if(user && (_.eq(user.pwd, password))) return when.resolve(user);//确认是1.5的账号
        return authUitls.getUserInfo2(value, password);//可能是1.5的账号，但是密码不正确；可能是2.0的账号  1.5的账号，但是使用2.0的密码--其实还是2.0的账号
        // if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 2, message: '密码不正确'}));
        // if(user.name == 'cssyllkadmin' && user.pwd == 'yllk1906') {
        //     user.schoolId = 828;
        // }
        // return when.resolve(user);
    }).then(function(user) {
        // if(user) console.log('pwd 2 - ', user.pwd);
        if(!user) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '用户不存在或密码不正确'}));//可能是1.5的账号但是密码不正确，也可能确实是个无效的账号
        if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '密码不正确'}));//2.0的账号但是密码不正确
        delete user.pwd;
        req.user = user;
        return getUserAuthorization(user.id, user.name);
    }).then(function(auth) {
        var authInfo = getUserAuthInfo(auth);
        req.user.auth = authInfo;
        return getSchoolById(req.user.schoolId)
    }).then(function(school) {
        var isLianKaoSchool = _.includes(school.name, '联考');
        req.user.auth.isLianKaoManager = (isLianKaoSchool) && (req.user.auth.isSchoolManager);
        var token = jsonwebtoken.sign({ user: req.user }, config.secret);
        req.user.token = token;
        next();
    }).catch(function(err) {
        next(err);
    })
}





// exports.authenticate = function(req, res, next) {
//     req.checkBody('value', '无效的value').notEmpty();
//     req.checkBody('password', '无效的password').notEmpty();
//     if(req.validationErrors()) return next(new errors.HttpStatusError(401, {errorCode: 1, message: '无效的用户名或密码'}));

//     var value = req.body.value.toLowerCase();
//     var password = req.body.password;

//     authUitls.getUserInfo(value).then(function(user) {
//         if(user) console.log('pwd - ', user.pwd);
//         if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 2, message: '密码不正确'}));
//         if(!user) return authUitls.getUserInfo2(value, password);
//         // if(user.name == 'cssyllkadmin' && user.pwd == 'yllk1906') {
//         //     user.schoolId = 828;
//         // }
//         return when.resolve(user);
//     }).then(function(user) {
//         if(user) console.log('pwd 2 - ', user.pwd);
//         if(!user) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '用户不存在'}));
//         if(user && (!_.eq(user.pwd, password))) return when.reject(new errors.HttpStatusError(401, {errorCode: 1, message: '密码不正确'}));
//         delete user.pwd;
//         req.user = user;
//         return getUserAuthorization(user.id, user.name);
//     }).then(function(auth) {
//         var authInfo = getUserAuthInfo(auth);
//         req.user.auth = authInfo;
//         return getSchoolById(req.user.schoolId)
//     }).then(function(school) {
//         var isLianKaoSchool = _.includes(school.name, '联考');
//         req.user.auth.isLianKaoManager = (isLianKaoSchool) && (req.user.auth.isSchoolManager);
//         var token = jsonwebtoken.sign({ user: req.user }, config.secret);
//         req.user.token = token;
//         next();
//     }).catch(function(err) {
//         next(err);
//     })
// }

function getSchoolById(schoolId) {
    return when.promise(function(resolve, reject) {
        peterHFS.get('@School.'+schoolId, function(err, school) {
            if(err || !school) return reject(new errors.data.MongoDBError('find school:'+schoolId+' error', err));
            resolve(school);
        });
    });
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

/**
 * 获取用户原始权限内容
 * @param  {[type]} userId   [description]
 * @param  {[type]} userName [description]
 * @return {[type]}         [<authObject>]
 *                          authObject: { grade: xxx, group: xxx, subject: xxx }
 */
function getUserAuthorization(userId, userName) {
    //Note: 根据userId判断用户来自于哪个系统, 1.5的userId采用的是自增方式, 2.0的是uuid. 所以判断userId > 100000000(1亿)的就是2.0用户
    if(userId > 100000000) {
        // 2.0
        return authUitls.fetchUserAuthorization2(userId);
    } else {
        //1.5；加入了一个管理员的判断, 如果是admin结尾的账户则给全部权限, 防止有部分联考账户在阅卷没有角色和数据权限,导致无看数据权限
        if(userName.endsWith('admin')) {
            return when.resolve([adminPrivilege]);
        } else {
            return authUitls.fetchUserAuthorization(userId);
        }
    }
}

/**
 * 获取用户权限信息数据结构
 * @param  {[type]} auth [description]
 * @return {[type]}
 //Note: 如果gradeKey对应的是Boolean true，那么就是此年级主任。如果不是schoolManager那么就不带有此key--为了方便遍历
    {
        isSchoolManager: false/true,
        gradeAuth: {
            gradeKey: true,
            gradeKey: {
                subjectManagers: ,
                groupManagers: ,
                subjectTeachers: ,
                doubleSubjectTeachers
            },
            ...
        }
    }
Note: 算法描述：

角色        grade       subject     group
校领导：     null         null        null
年级主任：    xxx         null        null
学科组长：    xxx         xxx         null
班主任：     xxx          null        xxx
任课老师：   xxx          xxx         xxx

1.a是xxx，b是null，则a肯定包含b
2.a是xxx，b也是xxx，那么就看xxx是否等于xxx

最准确的组合应该是班级+科目，但是如果有年级level的，那么相当于此年级下的所有班级：年级+科目/年级班级+科目
[
    {
        grade: ,
        group: ,
        subject:
    }
]

具体的判断：
1.所有对象里如果有一个对象的grade是null，那么就是“校级领导”的权限，已经是最终结果，返回。
2.找到所有标识“年级主任”的object，删掉所有和此object中grade相同的object（即，留下这些年级主任的object，以及和年级主任不相同的grade的object）
3.将剩下的object针对grade进行group。在同一个grade里，计算subject和group的组合：
    四种情况：
        学科组长+班主任：保留全部object--某些班级的所有学科，所有班级的某一学科（两者在某些班级的某些学科上有交集，但是最终还是并集）-- 找出交集，保证在“班主任”阶段获取的时候不重复获取
        学科组长+任课老师：去掉“任课老师”object中和“学科组长”的subject值相同的object，然后保留剩下的--举例：所有班级的语文和某一班级的数学（切记去掉的是“任课老师”类型的object）
        班主任+任课老师：去掉“任课老师”object中和“班主任”的group值相同的object，然后保留剩下的--举例：3班全部学科，1班语文
        学科组长+班主任+任课老师：去掉“任课老师”object中和“学科组长”的subject值相同的object，去掉“任课老师”object中和“班主任”的group值相同的object，然后保留剩下的--初一年级所有班级的语文，初一1班--除了可以看语文，还可以看此班级的其他所有科目，初一2班的数学-- 找出交集，保证在“班主任”阶段获取的时候不重复获取（即，当既有“学科组长”又有“班主任”的时候就会有交集）

学科：    初一   语文     null
班主任：  初一   null     1
任课：    初一   数学      2
*/
function getUserAuthInfo(auth) {
    var isSchoolManager = ifSchoolManager(auth);
    if(isSchoolManager) return { isSchoolManager: true }
    var gradeAuth = filterGradeAuth(auth);
    return { gradeAuth: gradeAuth };
}

/**
 * 检查是否是校级领导的权限
 * @param  {[type]} auth [description]
 * @return {[type]}      [description]
 */
function ifSchoolManager(auth) {
    return _.some(auth, (obj) => {
        return (_.isNull(obj.grade) && _.isNull(obj.subject) && _.isNull(obj.group));
    });
}

/**
 * 根据年级过滤相应的权限
 * @param  {[type]} auth [description]
 * @return {[type]}
 * gradeAuth:  {
        gradeKey: true,
        gradeKey: {
            subjectManagers: ,
            groupManagers: ,
            subjectTeachers: ,
            doubleSubjectTeachers
        },
        ...
    }
 */
function filterGradeAuth(auth) {
    //Note: 找到所有标识“年级主任”的object，删掉所有和此object中grade相同的object（即，留下这些年级主任的object，以及和年级主任不相同的grade的object）
    var gradeManagers = _.filter(auth, (obj) => {
        return (!_.isNull(obj.grade) && _.isNull(obj.subject) && _.isNull(obj.group));
    });
    var gradeManagerKeys = _.map(gradeManagers, (obj) => {
        return obj.grade;
    });

    var otherGradeAuthObjects = _.filter(auth, (obj) => {
        //Note: 前面已经踢出了grade==null的，也过滤出了“年级主任”的，那么剩下的就肯定不是“年级主任”，那么从中找出不在已有的“年级主任”列表内的object即可
        return (!_.includes(gradeManagerKeys, obj.grade));
    });

    //1.对otherGradeAuthObjects进行groupBygrade
    var resetAuthObjectGradeMap = _.groupBy(otherGradeAuthObjects, 'grade');
    //2.对每一个grade key所对应的array进行处理
    var filtratedResetAuthObjectGradeMap = {};
    _.each(resetAuthObjectGradeMap, (authObjectsArr, gradeKey) => {
        filtratedResetAuthObjectGradeMap[gradeKey] = filterResetAuthObjects(authObjectsArr, gradeKey);
    });
    var gradeManagerAuthObjectGradeMap = {};
    _.each(gradeManagerKeys, (gradeKey) => {
        gradeManagerAuthObjectGradeMap[gradeKey] = true;
    });
    return _.assign(gradeManagerAuthObjectGradeMap, filtratedResetAuthObjectGradeMap);
}

/**
 *
 * @param  {[type]} authObjectsArr [description]
 * @param  {[type]} gradeKey       [description]
 * @return {[type]}
 authObject: {
                subjectManagers: [{grade: xxx, subject: xxx, group: null}, ...],
                groupManagers: [{grade: xxx, subject: null, group: xxx}, ...],
                subjectTeachers: [{grade: xxx, subject: xxx, group: xxx}, ...],
                doubleSubjectTeachers: [{grade: xxx, subject: xxx, group: xxx}, ...]
            }
 */
function filterResetAuthObjects(authObjectsArr, gradeKey) {
    var subjectManagers = _.filter(authObjectsArr, (obj) => {
        return _.isNull(obj.group);
    });
    var groupManagers = _.filter(authObjectsArr, (obj) => {
        return _.isNull(obj.subject);
    });
    var subjectTeachers = _.filter(authObjectsArr, (obj) => {
        return _.every(obj, (value, key) => !_.isNull(value));
    });
    //都针对任课老师的authObjects进行删除
    var subjectManagerKeys = _.map(subjectManagers, (obj) => {
        return obj.subject;
    });
    var groupManagerKeys = _.map(groupManagers, (obj) => {
        return obj.group;
    });
    //Note: 如果即有subjectManagers又有groupManagers那么就一定会有交集
    var doubleSubjectTeachers = [];
    if(subjectManagerKeys.length > 0 && groupManagerKeys.length > 0) {
        _.each(subjectManagerKeys, (subjectKey) => {
            _.each(groupManagerKeys, (groupKey) => {
                doubleSubjectTeachers.push({grade: gradeKey, subject: subjectKey, group: groupKey});
            });
        });
    }

    subjectTeachers = _.filter(subjectTeachers, (obj) => {
        return (!_.includes(subjectManagerKeys, obj.subject));
    });
    subjectTeachers = _.filter(subjectTeachers, (obj) => {
        return (!_.includes(groupManagerKeys, obj.group));
    });
    return {
        subjectManagers: subjectManagers,
        groupManagers: groupManagers,
        subjectTeachers: subjectTeachers,
        doubleSubjectTeachers: doubleSubjectTeachers
    }
}
