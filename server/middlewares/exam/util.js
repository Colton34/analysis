/*
* @Author: HellMagic
* @Date:   2016-04-30 13:32:43
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-22 11:27:07
*/
'use strict';
var _ = require('lodash');
var when = require('when');
var client = require('request');
var moment = require('moment');
var config = require('../../config/env');
var errors = require('common-errors');

var peterFX = require('peter').getManager('fx');

var getExamById = exports.getExamById = function(examid, fromType) {
    var url = config.analysisServer + '/exam?id=' + examid;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getExamById) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(getExamById)失败, examid = ' + examid));
            data.fetchId = examid;
            if(fromType) data.from = fromType;
            resolve(data);
        });
    })
}

var getPaperById = exports.getPaperById = function(paperId) {//Warning: 不是pid，而是paperId-即mongoID
    console.time('解析paper');
    var url = config.analysisServer + '/paper?p=' + paperId;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getPaperById) Error: ', err));
            var temp = JSON.parse(body);
            if(temp.error) return reject(new errors.Error('查询analysis server(getPaperById)失败, paperId = ' + paperId));
            console.timeEnd('解析paper');
            resolve(temp);
        });
    })
}

var getGradeExamBaseline = exports.getGradeExamBaseline = function(examId, grade) {
    return when.promise(function(resolve, reject) {
        var config = (grade) ? {examid: examId, grade: grade} : {examid: examId};
        peterFX.query('@ExamBaseline', config, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('getGradeExamBaseline Mongo Error: ', err));
            resolve(results[0]);
        });
    });
}

var getSchoolById = exports.getSchoolById = function(schoolId) {
    var url = config.analysisServer + '/school?id=' + schoolId;
    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getExamsBySchool) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) reject(new errors.URIError('查询analysis server(getExamsBySchool)失败, schoolId = ', schoolId));
            resolve(data);
        });
    });
}

function getValidAuthExams(validExams, userAuth) {
    if(userAuth.isSchoolManager) return validExams;
    return _.filter(validExams, (examItem) => {
        return _.intersection(_.keys(userAuth.gradeAuth), _.keys(_.groupBy(examItem['[papers]'], 'grade'))).length > 0;
    });
}

exports.getValidExamsBySchoolId = function(schoolId, userId, userAuth) {
    var ifSchoolHaveExams = false, errorInfo = {msg: ''};
    return getSchoolById(schoolId).then(function(data) {
        if(data['[exams]'] && data['[exams]'].length > 0) ifSchoolHaveExams = true;
        return filterValidExams(data['[exams]'], userId, schoolId, userAuth.isLianKaoManager);
    }).then(function(validExams) {
        if(!ifSchoolHaveExams) errorInfo.msg = '此学校没有考试';
        var existPapersExams = _.filter(validExams, (obj) => (obj['[papers]'] && obj['[papers]'].length > 0));
        if(ifSchoolHaveExams && existPapersExams.length == 0) errorInfo.msg = '此学校下考试都没有科目';
        if(ifSchoolHaveExams && userAuth.isLianKaoManager && validExams.length == 0) errorInfo.msg = '暂无联考考试内容可供查看';
        var validAuthExams = getValidAuthExams(validExams, userAuth);
        if(ifSchoolHaveExams && !userAuth.isLianKaoManager && validAuthExams.length == 0) errorInfo.msg = '您的权限下没有可查阅的考试';
        return when.resolve({
            validAuthExams: validAuthExams,
            errorInfo: errorInfo
        });
    });
}

//Note: 注意从此不再求学校年级基本信息了。关于缺考的信息【暂时】不做计算。
exports.generateExamInfo = function(examId, gradeName, schoolId, isLianKao) {
    var result;
    return getExamById(examId).then(function(exam) {
        result = exam;
        result.id = examId;
        result['[papers]'] = _.filter(result['[papers]'], (paper) => paper.grade == gradeName);
        result.fullMark = _.sum(_.map(result['[papers]'], (paper) => paper.manfen));
        result.startTime = exam.event_time;
        result.gradeName = gradeName;
        result.subjects = _.map(result['[papers]'], (obj) => obj.subject);
        // var resultPromises = isLianKao ? [getGradeExamBaseline(examId, gradeName)] : [getGradeExamBaseline(examId, gradeName), getValidSchoolGrade(schoolId, gradeName)];
        // return when.all(resultPromises);
        return getGradeExamBaseline(examId, gradeName);
    }).then(function(baseline) { //results
        // result.baseline = results[0];
        // if(!isLianKao) result.grade = results[1];
        result.baseline = baseline;
        return when.resolve(result);
    })
}

exports.generateDashboardInfo = function(exam) {//Note:这里依然没有对auth进行判断
    var paperBaseInfo = _.map(exam['[papers]'], (obj) => _.pick(obj, ['id', 'grade', 'paper']));
    var getPapersTotalInfoPromises = _.map(exam['[papers]'], (obj) => getPaperTotalInfo(obj.paper));
    return when.all(getPapersTotalInfoPromises).then(function(papers) {
        papers = _.map(papers, (paperItem, index) => _.assign({}, paperItem, paperBaseInfo[index]));
        return when.resolve(generateStudentsTotalInfo(papers));
    });
}

exports.generateExamReportInfo = function(exam) {
    console.time('all');
    console.time('fetch papers');
    return getPaperInstancesByExam(exam).then(function(papers) {
        console.timeEnd('fetch papers');
        console.time('generate');
        var result = generatePaperStudentsInfo(papers);
        console.timeEnd('generate');
        console.time('other');
        result.examStudentsInfo = _.sortBy(_.values(result.examStudentsInfo), 'score');
        var examClassesInfo = generateExamClassesInfo(result.examStudentsInfo);//TODO: Warning--这里本意是获取班级的【基本信息】，但是这又依赖于school.grade.class，所以这里【暂时】使用参考信息。
        console.timeEnd('other');
        console.timeEnd('all');
        return when.resolve({
            examStudentsInfo: result.examStudentsInfo,
            examPapersInfo: result.examPapersInfo,
            examClassesInfo: examClassesInfo
        })
    });
}

exports.saveCustomExam = function(customExam) {
    var url = config.analysisServer + '/save';
    return when.promise(function(resolve, reject) {
        client.post(url, {body: customExam, json: true}, function(err, response, body) {
            if (err) return reject(new errors.URIError('查询analysis server(save exam) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(save exam)失败'));
            resolve(body);
        });
    });
}

exports.createCustomExamInfo = function(examId, schoolId, examName, gradeName, userId) {
    return when.promise(function(resolve, reject) {
        var customExamInfo = {
            exam_id: examId,
            school_id: schoolId,
            name: examName,
            grade: gradeName,
            owner: userId,
            create_time: new Date(),
            status: 1
        };
        peterFX.create('@CustomExamInfo', customExamInfo, function(err, result) {
            if(err) return reject(new errors.data.MongoDBError('【createCustomExamInfo】Error: ', err));
            resolve(examId);
        });
    })
}

exports.delCustomExam = function(examId, schoolId) {
    return when.promise(function(resolve, reject) {
        var postBody = {
            "id" : examId,
            "school_id" : schoolId
        };
        var url = config.analysisServer + "/del";
        client.post(url, {body: postBody, json: true}, function(err, response, body) {
            if (err) return reject(new errors.URIError('查询analysis server(invalid exam) Error: ', err));
            if(!_.isEqual(body, 0)) {
                var bodyObj = JSON.parse(body);
                return reject(new errors.Error('查询analysis server(invalid exam)错误', bodyObj.error));
            }
            resolve(body);
        });
    });
}

exports.findCustomInfo = function(examId, userId) {
    return when.promise(function(resolve, reject) {
        peterFX.query('@CustomExamInfo', {exam_id: examId, status: 1, owner: userId}, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('查找CustomExamInfo Error : ', err));
            if(!results || results.length != 1) return reject(new errors.Error('无效的customExamInfo'));
            resolve(results[0]);
        });
    });
}

exports.inValidCustomExamInfo = function(customExamInfoId) {
    return when.promise(function(resolve, reject) {
        peterFX.set(customExamInfoId, {status: 0}, function(err, result) {
            if(err) return reject(new errors.data.MongoDBError('重置customExamInfo status Error: ', err));
            resolve(result);
        });
    });
}

function filterValidExams(originalExams, userId, schoolId, isLianKaoManager) {
    var temp = {};
    var validNotCustomExams = _.chain(originalExams).filter((examItem) => {
        return (isLianKaoManager) ? (examItem.from == '20') : (examItem.from != '20' && examItem.from != '40');
    }).map((examItem) => {
        return {
            id: examItem['exam'],
            from: examItem.from
        }
    }).value();
    var getExamInstancePromises = _.map(validNotCustomExams, (validExam) => getExamById(validExam.id));
    return when.all(getExamInstancePromises).then(function(examInstances) {
        return when.resolve(_.map(examInstances, (examItem, index) => _.assign({}, examItem, validNotCustomExams[index])));
    });

    //【暂时】取消自定义分析的内容。自定义分析的创建和查看都通过1.7
    // return getCustomExamInfoByUserId(userId, schoolId).then(function(userCustomExamInfos) {
    //     var validCustomExams = _.map(userCustomExamInfos, (obj) => {
    //         return {
    //             id: obj['exam_id'],
    //             from: '40'
    //         }
    //     });
    //     var allValidExams = _.concat(validNotCustomExams, validCustomExams);
    //     temp.allValidExams = allValidExams;
    //     var getExamInstancePromises = _.map(allValidExams, (validExam) => getExamById(validExam.id));
    //     return when.all(getExamInstancePromises);
    // }).then(function(examInstances) {
    //     return when.resolve(_.map(examInstances, (examItem, index) => _.assign({}, examItem, temp.allValidExams[index])));
    // });
}

function getCustomExamInfoByUserId(userId, schoolId) {
    return when.promise(function(resolve, reject) {
        peterFX.query('@CustomExamInfo', {owner: userId, status: 1, school_id: schoolId}, function(err, examInfos) {
            if(err) return reject(errors.data.MongoDBError('查询@CustomExamInfo Error(getCustomExamInfoByUserId): ', err));
            resolve(examInfos);
        });
    });
}

function getPaperTotalInfo(paperId) {
    var url = config.analysisServer + '/total?p=' + paperId;

    return when.promise(function(resolve, reject) {
        client.get(url, {}, function(err, res, body) {
            if (err) return reject(new errors.URIError('查询analysis server(getPaperTotalInfo) Error: ', err));
            var data = JSON.parse(body);
            if(data.error) return reject(new errors.Error('查询analysis server(getPaperTotalInfo)失败, paperId = ' + paperId));
            resolve(data);
        });
    });
}

function generateStudentsTotalInfo(papers) {
    var studentsTotalInfo = {}, paperStudentObj, allStudentsPaperInfo = [], temp;
    _.each(papers, (paperObj) => {
        var studentsPaperInfo = _.map(paperObj.y, (stuObj) => _.assign({pid: paperObj.id, paper: paperObj.paper}, stuObj));
        temp = {};
        temp.subject = paperObj.x[0].name;
        temp.manfen = paperObj.x[0].score;
        temp.students = studentsPaperInfo;
        temp.id = paperObj.id;
        allStudentsPaperInfo.push(temp);
        _.each(studentsPaperInfo, (studentObj) => {
            paperStudentObj = studentsTotalInfo[studentObj.id];
            if(!paperStudentObj) {
                paperStudentObj = _.pick(studentObj, ['id', 'name', 'class', 'school', 'kaohao']);
                paperStudentObj['paper'] = 'totalScore';
                paperStudentObj.score = 0;
                studentsTotalInfo[studentObj.id] = paperStudentObj;
            }
            paperStudentObj.score = paperStudentObj.score + studentObj.score;
        });
    });
    studentsTotalInfo = _.sortBy(_.values(studentsTotalInfo), 'score');
    return {
        studentsTotalInfo: studentsTotalInfo,
        allStudentsPaperInfo: allStudentsPaperInfo
    };
}

//TODO: 这里最好还是通过analysis server来返回学校的基本信息（添加grade等需要的字段），这样就完全避免查询数据库.
//【暂时】注销 -- 用不到
// function getValidSchoolGrade(schoolId, gradeName) {
//     return when.promise(function(resolve, reject) {
//         peterHFS.get('@School.'+schoolId, function(err, school) {
//             if(err || !school) {
//                 console.log('不存在此学校，请确认：schoolId = ', schoolId);
//                 return reject(new errors.data.MongoDBError('find school:'+schoolId+' error', err));
//             }
//             var targetGrade = _.find(school['[grades]'], (grade) => grade.name == gradeName);
//             if (!targetGrade || !targetGrade['[classes]'] || targetGrade['[classes]'].length == 0) {
//                 console.log('此学校没有对应的年假或从属此年级的班级：【schoolId = ' + schoolId + '  schoolName = ' + school.name + '  gradeName = ' + gradeName + '】');
//                 targetGrade = getMockExamGrade(scoresInfo, grade);
//                 // return when.reject(new errors.Error('学校没有找到对应的年级或者从属此年级的班级：【schoolId = ' +schoolId + '  schoolName = ' +school.name + '  gradeName = ' + gradeName + '】'));
//             }
//             resolve(targetGrade);
//         });
//     });
// }

function getPaperInstancesByExam(exam) {
    var getPaperInstancePromises = _.map(exam['[papers]'], (obj) => getPaperById(obj.paper));
    return when.all(getPaperInstancePromises);
}

function generatePaperStudentsInfo(papers) {
    var examPapersInfo = {}, examStudentsInfo = {};
    _.each(papers, (paperObj) => {
        examPapersInfo[paperObj.id] = formatPaperInstance(paperObj);
        var students = paperObj['[students]'], matrix = paperObj.matrix, paperStudentObj, answers = paperObj.answers;
        _.each(students, (studentObj, index) => {
            paperStudentObj = examStudentsInfo[studentObj.id];
            if(!paperStudentObj) {
                paperStudentObj = _.pick(studentObj, ['id', 'name', 'class', 'school']);
                paperStudentObj.papers = [], paperStudentObj.questionScores = [], paperStudentObj.score = 0;
                examStudentsInfo[studentObj.id] = paperStudentObj;
            }
            paperStudentObj.score = paperStudentObj.score + studentObj.score;
            paperStudentObj.papers.push({id: studentObj.id, paperid: paperObj.id, score: studentObj.score, 'class_name': studentObj.class});
            paperStudentObj.questionScores.push({paperid: paperObj.id, scores: matrix[index], answers: answers[index]});
        });
    });
    return {
        examPapersInfo: examPapersInfo,
        examStudentsInfo: examStudentsInfo
    }
}

function formatPaperInstance(paperObj) {
    var result = _.pick(paperObj, ['id', 'subject', 'grade']);
    result.paper = paperObj._id;
    result.fullMark = paperObj.manfen;
    result.questions = paperObj['[questions]'];
    var paperStudents = paperObj['[students]'];
    var paperStudentsByClass = _.groupBy(paperStudents, 'class');

    result.realClasses = _.keys(paperStudentsByClass);
    result.realStudentsCount = paperStudents.length;

    var paperClassCountInfo = {};
    _.each(paperStudentsByClass, (pcStudents, className) => {
        paperClassCountInfo[className] = pcStudents.length;
    });
    result.classes = paperClassCountInfo;
    return result;
}

function generateExamClassesInfo(examStudentsInfo) {
    var result = {}, studentsByClass = _.groupBy(examStudentsInfo, 'class');
    _.each(studentsByClass, (classStudents, className) => {
        var classStudentIds = _.map(classStudents, (obj) => obj.id);//TODO: 不确定之前DB中的school.grade.class.students里的String是kaohao, xuehao还是id。这里先存储为student.id
        result[className] = {
            name: className,
            students: classStudentIds,
            realStudentsCount: classStudentIds.length
        }
    });
    return result;
}

/*
@EquivalentScoreInfo:
    examId: String,
    examName: String,
    id: String,
    objectId: String,
    name: String,
    fullMark: Integer,
    percentage: Integer,
    equivalentScore: Integer
}
 */

// exports.getEquivalentScoreInfoById = function(examid) {
//     return fetchEquivalentScoreInfoById(examid).then(function(equivalentScoreInfo) {
//         return (!equivalentScoreInfo) ? getDefaultEquivalentScoreInfo(examid) : when.resolve(equivalentScoreInfo);
//     })
// }

exports.getEquivalentScoreInfoById = function(examid) {
    //1.去query，找到返回  找不到 获取default，然后save，然后返回带有objectId的实例数据结构
    return when.promise(function(resolve, reject) {
        peterFX.query('@EquivalentScoreInfo', {examId: examid}, function(err, results) {
            if(err) return reject(new errors.data.MongoDBError('fetchEquivalentScoreInfoById Error', err));
            if(results.length > 1) reject(new errors.Error('fetchEquivalentScoreInfoById Error: 重复的exam equivalent score设置'));
            resolve(results[0]);
        });
    }).then(function(equivalentScoreInfo) {
        if(equivalentScoreInfo) return when.resolve(equivalentScoreInfo);
        return getDefaultEquivalentScoreInfo(examid);
    });
}

function getDefaultEquivalentScoreInfo(examid) {
    return getExamById(examid, '50').then(function(examInstance) {
                //TODO: 需要过滤grade？？？
        var lessons = _.map(examInstance['[papers]'], (paperItem) => {
            // if(_.includes(paperItem.name, '文科')) return {id: paperItem.id, objectId: paperItem.paper, name: `${paperItem.subject}(文科)`, fullMark: paperItem.manfen, percentage: 1, equivalentScore: paperItem.manfen};
            // if(_.includes(paperItem.name, '理科')) return {id: paperItem.id, objectId: paperItem.paper, name: `${paperItem.subject}(理科)`, fullMark: paperItem.manfen, percentage: 1, equivalentScore: paperItem.manfen};
            return {id: paperItem.id, objectId: paperItem.paper, name: paperItem.name, subject: paperItem.subject, fullMark: paperItem.manfen, percentage: 1, equivalentScore: paperItem.manfen};
        });
        return saveEquivalentScoreInfo({
            examId: examid,
            examName: examInstance.name,
            '[lessons]': lessons
        });
    });
}

function saveEquivalentScoreInfo(equivalentScoreInfoObj) {
    return when.promise(function(resolve, reject) {
        peterFX.create('@EquivalentScoreInfo', equivalentScoreInfoObj, function(err, objectId) {
            if(err) return reject(new errors.data.MongoDBError('saveEquivalentScoreInfo Error: ', err));
            equivalentScoreInfoObj._id = objectId;
            resolve(equivalentScoreInfoObj);
        });
    });
}

exports.getZoubanExamInfo = function(paperObjectIds, equivalentScoreInfo) {
    return when.all(_.map(paperObjectIds, (paperObjectId) => getPaperById(paperObjectId)))
        .then(function(paperInstances) {
            return generateZoubanPaperStudentsInfo(paperInstances, equivalentScoreInfo);
        });
}

function generateZoubanPaperStudentsInfo(papers, equivalentScoreInfo) {
    var examStudentsInfo = {}, examPapersInfo = {}, equivalentScoreInfoMap = _.keyBy(equivalentScoreInfo['[lessons]'], 'objectId'), studentCurrentLessonEquivalentScore;
    // var ifAnyLessonEquivalent = _.some(equivalentScoreInfoMap, (obj) => obj.percentage != 1);
    // console.log('ifAnyLessonEquivalent ============= ', ifAnyLessonEquivalent);
    return when.promise(function(resolve, reject) {
        try {
            _.each(papers, (paperObj) => {
                examPapersInfo[paperObj._id] = formatZoubanLessonInstance(paperObj);
                var students = paperObj['[students]'], matrix = paperObj.matrix, paperStudentObj, answers = paperObj.answers;
                _.each(students, (studentObj, index) => {
                    paperStudentObj = examStudentsInfo[studentObj.id];
                    if(!paperStudentObj) {
                        paperStudentObj = _.pick(studentObj, ['id', 'name', 'xuehao', 'kaohao']);
                        paperStudentObj.papers = [], paperStudentObj.classes = [], paperStudentObj.score = 0, paperStudentObj.equivalentScore = 0; //paperStudentObj.questionScores = []
                        examStudentsInfo[studentObj.id] = paperStudentObj;
                    }
                    paperStudentObj.classes.push({paperObjectId: paperObj._id, name: studentObj.class});
                    paperStudentObj.score = paperStudentObj.score + studentObj.score;
                    studentCurrentLessonEquivalentScore = _.round(_.multiply(studentObj.score, equivalentScoreInfoMap[paperObj._id].percentage), 2);
                    paperStudentObj.equivalentScore = paperStudentObj.equivalentScore + studentCurrentLessonEquivalentScore;
                    paperStudentObj.papers.push({id: studentObj.id, name: studentObj.name, paperid: paperObj.id, paperObjectId: paperObj._id, score: studentObj.score, equivalentScore: studentCurrentLessonEquivalentScore, 'class_name': studentObj.class, questionScores: matrix[index], questionAnswers: answers[index]});
                    // paperStudentObj.questionScores = matrix[index], paperStudentObj.questionAnswers = answers[index];
                    // paperStudentObj.questionScores.push({paperid: paperObj.id, scores: matrix[index], answers: answers[index]});
                });
            });
            resolve({
                examStudentsInfo: examStudentsInfo,
                examPapersInfo: examPapersInfo
            })
        } catch(e) {
            reject(new errors.Error('generateZoubanPaperStudentsInfo(Format) Error'));
        }
    });
}

function formatZoubanLessonInstance(paperObj) {
    var result = _.pick(paperObj, ['id', 'subject', 'grade']);
    result.objectId = paperObj._id;
    result.fullMark = paperObj.manfen;
    result.questions = paperObj['[questions]'];
    // var paperStudents = paperObj['[students]'];
    // var paperStudentsByClass = _.groupBy(paperStudents, 'class');

    // result.realClasses = _.keys(paperStudentsByClass);
    // result.realStudentsCount = paperStudents.length;

    // var paperClassCountInfo = {};
    // _.each(paperStudentsByClass, (pcStudents, className) => {
    //     paperClassCountInfo[className] = pcStudents.length;
    // });
    // result.classes = paperClassCountInfo;
    return result;
}


// function getMockExamGrade(scoresInfo, gradeName) {
//     var classes = _.map(scoresInfo, (studentObjs, className) => {
//         var studentIds = _.map(studentObjs, (obj) => obj.id);
//         return {
//             name: className,
//             '[students]': studentIds
//         }
//     });
//     return {
//         name: gradeName,
//         '[classes]': classes
//     }
// }
