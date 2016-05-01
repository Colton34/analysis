/*
* @Author: HellMagic
* @Date:   2016-04-30 13:32:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-30 14:48:06
*/

'use strict';

var peterMgr = require('../../lib/peter').Manager;
var when = require('when');
var _ = require('lodash');
var errors = require('common-errors');

exports.getExamClass = function(exam) {
    //通过exam.schoolid获取school实例，然后school.grades->classes reduce出来
    return when.promise(function(resolve, reject) {
        peterMgr.get(exam.schoolid, function(err, school) {
            if(err) return reject(new errors.data.MongoDBError('find school:'+exam.schoolid+' error', err));
            var result = _.reduce(school.grades, function(sum, grade, index) {
                return sum += (grade.classes ? grade.classes.length : 0);
            }, 0);
            resolve(result);
        });
    });
};

exports.getAllStudentsByExam = function(exam) {
    return when.promise(function(resolve, reject) {
        //参加本场考试的所有studnetIds，然后得到studentsPromises
    })
}
