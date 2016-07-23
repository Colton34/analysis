/*
* @Author: liucong
* @Date:   2016-03-31 11:59:40
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-23 16:17:37
*/

'use strict';

var _ = require("lodash");
var path = require('path');
var bcrypt = require('bcryptjs');
var util = require('util');
var jsonwebtoken = require("jsonwebtoken");
var Router = require("express").Router;
var murmur = require('murmur'); //TODO: 应该是没用了，可以把此module从node中去除了
var when = require('when');
var errors = require('common-errors');
var ObjectId = require('mongodb').ObjectId;
// var md5 = crypto.createHash('md5');

var debug = require('debug')('app:utils:' + process.pid);

var peterHFS = require('peter').getManager('hfs');

var UnauthorizedAccessError = require('../../errors/UnauthorizedAccessError');
var BadRequestError = require('../../errors/BadRequestError');
var DBError = require('../../errors/DBError');

var config = require('../../config/env');
var debug = require('debug')('app:routes:default' + process.pid);

var authUitls = require('./util');
var adminPrivilege = {grade: null, group: null, subject: null};

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
        req.user = user;
        return getUserAuthorization(user.id, user.name);
    }).then(function(auth) {
        //TODO: 将拿到的原始auth进行转换，存储转换后的auth
        var authInfo = getUserAuthInfo(auth);

console.log('authInfo === ', JSON.stringify(authInfo));

        req.user.auth = authInfo;
        var token = jsonwebtoken.sign({ user: req.user }, config.secret);
        req.user.token = token;
console.log('登录成功');
        next();
    }).catch(function(err) {
        next(err);
    })
}


/*
            grade       subject     group
校领导：     null         null        null
年级主任：    xxx         null        null
学科组长：    xxx         xxx         null
班主任：     xxx          null        xxx
任课老师：   xxx          xxx         xxx

1.你是xxx，我是null，则我肯定包含你
2.你是xxx，我也是xxx，那么就看xxx是否等于xxx

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

4.拿到过滤后的object，然后逐个取相应的数据（怎么避免交集？）
 */


//Note: 当点击一个exam的时候就指定了一个grade了

/*
数据结构：
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

 */
function getUserAuthInfo(auth) {
// console.log('============ 1');

    var isSchoolManager = ifSchoolManager(auth);
    // if(isSchoolManager) return [{grade: null, subject: null, group: null}];
    if(isSchoolManager) return { isSchoolManager: true }
    var gradeAuth = filterGradeAuth(auth);
    return { gradeAuth: gradeAuth };
}

function ifSchoolManager(auth) {
    return _.some(auth, (obj) => {
        return (_.isNull(obj.grade) && _.isNull(obj.subject) && _.isNull(obj.group));
    });
}

function filterGradeAuth(auth) {
// console.log('============ 2');
    //找到所有标识“年级主任”的object，删掉所有和此object中grade相同的object（即，留下这些年级主任的object，以及和年级主任不相同的grade的object）
    var gradeManagers = _.filter(auth, (obj) => {
        return (!_.isNull(obj.grade) && _.isNull(obj.subject) && _.isNull(obj.group));
    });
    var gradeManagerKeys = _.map(gradeManagers, (obj) => {
        return obj.grade;
    });

    var otherGradeAuthObjects = _.filter(auth, (obj) => {
        //前面已经踢出了grade==null的，也过滤出了“年级主任”的，那么剩下的就肯定不是“年级主任”，那么从中找出不在已有的“年级主任”列表内的object即可
        return (!_.includes(gradeManagerKeys, obj.grade));
    });
    //1.对otherGradeAuthObjects进行groupBygrade
    var resetAuthObjectGradeMap = _.groupBy(otherGradeAuthObjects, 'grade');

// console.log('============ 3');

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

    // var resetAuthObjects = (..._.concat(_.map(resetAuthObjectGradeMap, (authObjectsArr, gradeKey) => {
    //     return filterResetAuthObjects(authObjectsArr, gradeKey);
    // })));
    // return _.concat(gradeManagers, resetAuthObjects);
}

function filterResetAuthObjects(authObjectsArr, gradeKey) {
// console.log('============ 4');
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
// console.log('============ 5');
    //如果即有subjectManagers又有groupManagers那么就一定会有交集
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
    // return _.concat(subjectManagers, groupManagers, subjectTeachers);
}


exports.verify = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.authorization;
    if(!token) return next(new errors.HttpStatusError(400, '没有令牌，拒绝访问，请登录~'));

    when.promise(function(resolve, reject) {
        jsonwebtoken.verify(token, config.secret, function (err, decode) {
            if (err) return reject(new errors.HttpStatusError(401, {errorCode: 3, message: '无效的令牌，拒绝访问，请登录~'}));
            //如果验证通过，则通过decode._id，然后去找user，并赋值给req.user
            resolve(decode.user);
        });
    }).then(function(user) {
        user.token = token;
        req.user = user;
next();
        // return getUserAuthorization(req.user.id, req.user.name);
    }).catch(function(err) {
        next(err);
    });
};
// .then(function(auth) {
//         req.user.auth = auth;
//         next();
//     })

//Note: 返回的是个数组！！！数组里是代表权限的objet--{grade: xxx, group: xxx, subject: xxx}
function getUserAuthorization(userId, userName) {
    //根据userId判断用户来自于哪个系统, 1.5的userId采用的是自增方式, 2.0的是uuid. 所以判断userId > 100000000(1亿)的就是2.0用户
    if(userId > 100000000) {
        // 2.0
        return authUitls.fetchUserAuthorization2(userId);
    } else {
        //1.5
        //加入了一个管理员的判断, 如果是admin结尾的账户则给全部权限, 防止有部分联考账户在阅卷没有角色和数据权限,导致无看数据权限
        if(userName.endsWith('admin')) {
            return when.resolve([adminPrivilege]);
        } else {
            return authUitls.fetchUserAuthorization(userId);
        }
    }
}

/*

.then(function(userid) {

console.log('userid = ', userid);

//         return when.promise(function(resolve, reject) {
//             //照当前来看是不再需要查询的，因为decord里就有几乎我们要的信息了，id, name,schoolId
//             peterHFS.get('@Teacher.'+userid, function(err, user) {
//                 if(err) return reject(new DBError('500', {message: 'find user error'}));

// console.log('user.name = ', user.name);

//                 resolve(user);
//             });
//         });
    })

 */


// exports.validate = function(req, res, next) {
//     if(req.validationErrors()) next(req.validationErrors());
//     next();
// }



// exports.authenticate = function (req, res, next) {
//     debug("Processing authenticate middleware");
//     var value = req.body.value;//注意：body里面写value而不再是username
//     var password = req.body.password;//暂时还是明文传递过来，后面进行md5

//     //TODO:使用express-validator来处理各种验证的需求
//     if (_.isEmpty(value) || _.isEmpty(password)) {
//         return next(new UnauthorizedAccessError("401", {
//             message: 'Invalid value or password'
//         }));
//     }
//     value = value.toLowerCase();

// //1.验证User的usernmae和password是否有效：new UnauthorizedAccessError("401", { message: 'Invalid username or password' })
//     var hash = murmur.hash128(value).hex().substr(0, 24);

//     when.promise(function(resolve, reject) {
//         peterHFS.get('@UserIndex.' + hash, function(err, result) {
//             if(err) return reject(new DBError('500', { message: 'get user index error' }));
//             var target = _.find(result['[list]'], function(item) {
//                 return value == item.key;
//             });
//             if(!target) return reject(new UnauthorizedAccessError('401', { message: 'not found user of value : ' + value }));
//             resolve(target);
//         });
//     }).then(function(target) {
//         return when.promise(function(resolve, reject) {
//             peterHFS.get(target.userid, ['_id', 'pass'], function(err, result) {
//                 if(err) return reject(new DBError('500', { message: 'find user error' }));
//                 if(!result) return reject(new UnauthorizedAccessError('401', { message: 'db not found user of value = ' + value}));

//                 //md5.update(result.pass)
//                  result.pass == password ? resolve(result) : reject(new UnauthorizedAccessError('401', { message: 'invalid password' }));
//             });
//         });
//     }).then(function(user) {
//         var token = jsonwebtoken.sign({ _id: user._id.toString() }, config.secret);
//         user.token = token;
//         req.user = user;
//         next();
//     }).catch(function(err) {
//         next(err);
//     });
// };

