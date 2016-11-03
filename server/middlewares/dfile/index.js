/*
* @Author: HellMagic
* @Date:   2016-06-01 14:27:51
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-11-03 16:19:54
*/

'use strict';

var fs = require('fs');
var tmp = require('tmp');
var XLSX = require('xlsx');
var path = require('path');
var errors = require('common-errors');
var excel = require("node-excel-export");
var phantom = require('phantomjs-prebuilt');
var childProcess = require('child_process');

var nodeExcel = require('excel-export');

var tempFileDir = path.join(__dirname, '../../..', 'tempFiles');

/**
 * 使用phantomjs渲染需要下载的页面，并生成快照临时文件等待下载
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.renderSchoolReport = function(req, res, next) {
    req.checkBody('url', '无效的url').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    //Note: 先检测tempFileDir是否存在如果不存在则自动创建--节省时间，默认手动创建此文件夹
    // fs.access(tempFileDir, fs.F_OK, function(err) {
    //     if(err) fs.mkdirSync(tempFileDir);

    // });
    var tmpobj = tmp.fileSync({ postfix: '.pdf', dir: tempFileDir });
    var renderBaseUrl = process.env.RENDERHOSTNAME || 'localhost:3000';

    var childArgs = [
        path.join(__dirname, '../..', 'lib', 'phantom-script.js'),
        'http://'+renderBaseUrl+req.body.url,
        req.user.token,
        path.join(tmpobj.name)
    ];

    childProcess.execFile(phantom.path, childArgs, function(err, stdout, stderr) {
        if(err) return next(new errors.Error('convert html to file error', err));
        res.status(200).send(childArgs[3]);
    });
}

/**
 * 通过Post请求（而不是link形式）来下载生成的报告
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.downloadSchoolReport = function(req, res, next) {
    var stat = fs.statSync(req.query.filename);
    res.status(200).download(req.query.filename, '校级报告.pdf');
}

/**
 * 为了避免无用报告文件堆积，临时文件被下载后即被删除
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.rmSchoolReport = function(req, res, next) {
    //下载成功后删除此临时文件
    req.checkQuery('filename', '无效的filename').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    fs.unlink(req.query.filename, function(err) {
        if(err) return next(new errors.Error('删除文件错误', err));
        res.status(200).end();
    });
}

/**
 * 自定义分析中选择科目位置的“下载校考导入模板”
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.downloadExamTmp = function(req, res, next) {
    var fileDir = path.join(__dirname, '../../../public/files');
    var filename = (req.query && req.query.liankao) ? '联考小分模板.xlsx' : '校内考试小分模板.xlsx';
    var fileUrl = path.join(fileDir, filename);
    res.download(fileUrl, filename);
}

/**
 * 自定义分析开始页面中“查看示例”
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.downloadExamGuide = function(req, res, next) {
    var fileDir = path.join(__dirname, '../../../public/files');
    var filename = '自定义分析操作手册.pdf';
    var fileUrl = path.join(fileDir, filename);
    res.download(fileUrl, filename);
}

/**
 * 首页"下载使用说明书"
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.downloadHomeGuide = function(req, res, next) {
    var fileDir = path.join(__dirname, '../../../public/files');
    var filename = '好分数分析系统使用说明书.pdf';
    var fileUrl = path.join(fileDir, filename);
    res.download(fileUrl, filename);
}


/*
TODO:补充联考
Warning：原来这里是区分联考的，这里暂时没有联考的逻辑--因为没有在auth后的user信息中看到。
 if(req.session.user.isLiankao === result.data.isLiankao){
     res.json(httpResult.succ(result.data));
 }else{
     res.json(httpResult.err_logic(`模板上传错误, 请上传${req.session.user.isLiankao ? '联考' : '校内'}模板`));
 }
 */
/**
 * 自定义分析中选择考试科目位置“导入线下考试数据”
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.importExamData = function(req, res, next) {
    var file = req.file;
    var result = xlsxParser(file, parsePaperScore);

    if(result.code === 0){
        res.status(200).json(result.data);
    }else{
        next(new errors.Error('解析考试分数数据错误'));
    }
}

/**
 * 自定义分析中确认学生位置“上传考生数据”
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.importExamStudent = function(req, res, next) {
    var file = req.file;
    var result = xlsxParser(file, parseStudentList);

    if(result.code === 0) {
        res.status(200).json(result.data);
    } else {
        next(new errors.Error('解析考试学生数据错误：' + result.msg));
    }
}

/**
 * 自定义分析中确认考生位置“导出考生数据”
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.exportExamStudent = function(req, res, next) {
    if(!req.body || !req.body['students']) return next(new errors.Error('没有有效的需要导出的学生数据'));

    var students = JSON.parse(req.body['students']);
    try{
        var headerDark= {
            fill: {
                fgColor: {
                    rgb: 'FFFFFFFF'
                }
            },
            font: {
                color: {
                    rgb: '00000000'
                },
                sz: 14,
                bold: true
            }
        };

        var specification = {
            'kaohao': {
                displayName: '考号',
                headerStyle: headerDark,
                width: 120
            },
            'name': {
                displayName: '姓名',
                headerStyle: headerDark,
                width: 120
            },
            'class' :{
                displayName: '班级',
                headerStyle: headerDark,
                width: 120
            }
        };

        var report = excel.buildExport(
            [
                {
                    name: '学生列表',
                    specification: specification,
                    data: students // <-- Report data
                }
            ]
        );

        res.attachment('学生列表.xlsx');
        res.status(200).send(report);
    }catch(err){
        next(new errors.Error('生成学生列表错误', err));
    }
}

    // // conf.stylesXmlFile = "styles.xml";
    // conf.cols = [{
    //     caption:'string',
    //     type:'string',
    //     beforeCellWrite:function(row, cellData){
    //          return cellData.toUpperCase();
    //     },
    //     width:28.7109375
    // },{
    //     caption:'date',
    //     type:'date',
    //     beforeCellWrite:function(){
    //         var originDate = new Date(Date.UTC(1899,11,30));
    //         return function(row, cellData, eOpt){
    //             if (eOpt.rowNum%2){
    //                 eOpt.styleIndex = 1;
    //             }
    //             else{
    //                 eOpt.styleIndex = 2;
    //             }
    //             if (cellData === null){
    //               eOpt.cellType = 'string';
    //               return 'N/A';
    //             } else
    //               return (cellData - originDate) / (24 * 60 * 60 * 1000);
    //         }
    //     }()
    // },{
    //     caption:'bool',
    //     type:'bool'
    // },{
    //     caption:'number',
    //      type:'number'
    // }];
    // conf.rows = [
    //     ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
    //     ["e", new Date(2012, 4, 1), false, 2.7182],
    //     ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
    //     ["null date", null, true, 1.414]
    // ];

exports.newExportRankReport = function (req, res, next) {
    req.checkBody('cols', '无效的cols').notEmpty();
    req.checkBody('rows', '无效的rows').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    try {
        var cols = JSON.parse(req.body.cols);
        var rows = JSON.parse(req.body.rows);
        var userAgent = (req.headers['user-agent']||'').toLowerCase();
        var filename = req.body.filename || '下载';

        var conf ={};
        conf.name = 'report';
        conf.cols = getFormatCols(cols, rows[0]);
        conf.rows = rows;

        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');

        if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename)+'.xlsx');
        } else if(userAgent.indexOf('firefox') >= 0) {
            res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename)+'"'+'.xlsx');
        } else {
            res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary')+'.xlsx');
        }


        // res.setHeader("Content-Disposition", "attachment; filename=" + 'hello' + ".xlsx");
        res.end(result, 'binary');
    } catch(e) {
        next(new errors.Error('生成表格下载文件错误', e));
    }
}

function getFormatCols(cols, rowData) {
    var type, data;
    return _.map(cols, (colName, index) => {
        data = rowData[index];
        type = (_.isString(data) ? 'string' : (_.isNumber(data) ? 'number' : 'string'));
        return {
            caption: colName,
            type: type
        }
    });
}

/**
 * 排行榜详情，下载“排行榜”报告
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.exportRankReport = function(req, res, next) {
    //接收到客户端的数据，然后输出excel file
    req.checkBody('keys', '无效的keys').notEmpty();
    req.checkBody('names', '无效的names').notEmpty();
    req.checkBody('matrix', '无效的matrix').notEmpty();
    if(req.validationErrors()) return next(req.validationErrors());

    var headerDark= {
        fill: {
            fgColor: {
                rgb: 'FFFFFFFF'
            }
        },
        font: {
            color: {
                rgb: '00000000'
            },
            sz: 14,
            bold: true
        }
    };

    //构造 specification和object data
    try {
        var keys = JSON.parse(req.body.keys);
        var names = JSON.parse(req.body.names);
        var matrix = JSON.parse(req.body.matrix);
        var exportTableName = req.body.exportTableName ? req.body.exportTableName : '排行榜';
        var specification = {};
        _.each(keys, (k, i) => {
            specification[k] = {
                displayName: names[i],
                headerStyle: headerDark
            };
        });
        //每一行是一个对象--对象对应key:value，构成一个对象数组
        var datas = _.map(matrix, (sinfo) => {
            var obj = {};
            _.each(keys, (k, i) => {
                obj[k] = sinfo[i];
            });
            return obj;
        });

        var report = excel.buildExport(
            [
                {
                    name: exportTableName,
                    specification: specification,
                    data: datas
                }
            ]
        );

        res.attachment(exportTableName + '.xlsx');
        res.status(200).send(report);
    } catch(e) {
        next(new errors.Error('生成表格下载文件错误，表格名：' + exportTableName, e));
    }
}

function xlsxParser(file, handler){
    var result = {code : 1, msg : ''};

    if (!file.originalname.endsWith('xlsx') && !file.originalname.endsWith('xls')) {
        result.msg = '上传文件格式不正确，请上传excel文件';
        return result;
    }
    var arr = [];
    for (var i = 0; i != file.buffer.length; ++i) {
        arr[i] = String.fromCharCode(file.buffer[i]);
    }
    var bstr = arr.join('');
    var wb = XLSX.read(bstr, {type: 'binary'});
    var first_sheet_name = wb.SheetNames[0];
    /* Get worksheet */
    var ws = wb.Sheets[first_sheet_name];
    return handler(ws);
}

/**
 * 解析paper小分表数据
 * @param ws
 * @returns {{code: number, msg: string, data: {}}}
 */
function parsePaperScore(ws) {
    //code = 1,有错误; code = 0, 正确解析,内容在data
    var result = {
        code: 1,
        msg: '',
        data: {
            isLiankao : false
        }
    };

    var
        cell_index, cell, cell_value,
        x = [], y = [], m = [];

    var profile = getWorkSheetProfile(ws);
    if (profile.isEmpty) {
        result.msg = '文件内容为空';
        return result;
    }

    if (ws['B1']) {
        result.data.grade = ws['B1'].v;
    } else {
        result.msg += '请填写年级名称\n';
    }

    if (ws['D1']) {
        result.data.subject = ws['D1'].v;
    } else {
        result.msg += '请填写科目名称</br>';
    }

    var headerMapper = {
        "学号": "学籍号",
        "学籍号": "学籍号",
        "学籍号(选填)": "学籍号",
        "学籍号（选填）": "学籍号",
        "考号": "考号",
        "id": "id",
        "名字": "姓名",
        "姓名": "姓名",
        "班级": "班级",
        "分组": "班级",
        "class": "班级",
        "学校": "学校"
    };

    var valueMap = {};
    var questionMap = {};
    var row = 0;
    for (var i = 1; i <= profile.maxRow; i++) {
        row = i;
        cell_index = XLSX.utils.encode_cell({r: i, c: 0});
        cell_value = ws[cell_index] && ws[cell_index].v;
        //确定这是title行
        if (headerMapper[cell_value]) {

            for (var j = 0; j <= profile.maxCol; j++) {
                cell_index = XLSX.utils.encode_cell({r: i, c: j});
                //确定单元格里有数据
                if (ws[cell_index]) {
                    cell_value = ws[cell_index].v;
                    if (headerMapper[cell_value]) {
                        valueMap[j] = headerMapper[cell_value];
                    } else {
                        questionMap[j] = cell_value;
                    }
                }
            }
            break;
        }
    }

    if (_.isEqual({}, valueMap)) {
        result.msg = '文件格式错误，表头信息不完整, 缺少学生相关内容';
        return result;
    }
    if (_.isEqual({}, questionMap)) {
        result.msg = '文件格式错误，表头信息不完整, 没有题目名称';
        return result;
    }

    //再往下一行应该是满分数据
    if (++row > profile.maxRow) {
        result.msg = '文件内容不完整,缺少题目满分数据';
        return result;
    }

    //构建x
    for (var qIndex in questionMap) {
        cell_index = XLSX.utils.encode_cell({r: row, c: qIndex});
        var questionName = questionMap[qIndex];
        cell = ws[cell_index];
        if (!cell) {
            result.msg += `${questionName}没有对应满分数值##`;
            continue;
        }

        cell_value = +cell.v;
        if (_.isNaN(cell_value) || cell_value <= 0) {
            result.msg += `${questionName}满分数值小于0,请更正后重新上传##`;
            continue;
        }

        x.push({name: questionName, score: cell_value});
    }

    //构建y,m
    for (++row; row <= profile.maxRow; row++) {

        var student = {id: row};

        for (var col in valueMap){
            var header = valueMap[col];
            cell_index = XLSX.utils.encode_cell({r: row, c: col});
            cell = ws[cell_index];
            cell_value = cell && cell.v;

            if (!cell && '学籍号' !== header) {
                result.msg += `第${row + 1}行学生信息不完整[${header}]##`;
                continue;
            }

            switch (header) {
                case '姓名' :
                {
                    student.name = cell_value;
                    break;
                }
                case '学籍号' :
                {
                    student.xuehao = cell_value;
                    break;
                }
                case '考号' :
                {
                    student.kaohao = '' + cell_value;
                    break;
                }
                case '班级' :
                {
                    student['class'] = '' + cell_value;
                    break;
                }
                case '学校' :
                {
                    student.school = cell_value;
                    result.data.isLiankao = true;
                    break;
                }
            }
        }
        var studentScore = [];
        var sum = 0;
        for (var qIndex in questionMap) {
            cell_index = XLSX.utils.encode_cell({r: row, c: qIndex});
            cell = ws[cell_index];
            cell_value = +(cell && cell.v);
            if (_.isNaN(cell_value)) {
                cell_value = 0;
            }
            studentScore.push(cell_value);
            sum += cell_value;
        }

        student.score = sum;
        m.push(studentScore);
        y.push(student);
    }

    result.data.matrix = {
        x: x,
        y: y,
        m: m
    };

    if(result.msg.length == 0){
        result.code = 0;
    }
    return result;
}

/**
 * 提取概要信息
 * @param ws
 * @returns {{isEmpty: boolean, maxCol: number, maxRow: number}}
 */
function getWorkSheetProfile(ws) {
    var result = {
        isEmpty: true,
        maxCol: 0,
        maxRow: 0
    };

    for (var z in ws) {
        /* all keys that do not begin with "!" correspond to cell addresses */
        if (z[0] === '!') continue;
        result.isEmpty = false;
        var ca = XLSX.utils.decode_cell(z);
        result.maxCol = result.maxCol > ca.c ? result.maxCol : ca.c;
        result.maxRow = result.maxRow > ca.r ? result.maxRow : ca.r;
    }
    return result;
}


function parseStudentList(ws){
    //code = 1,有错误; code = 0, 正确解析,内容在data
    var result = {
        code: 1,
        msg: '',
        data: {}
    };

    var cell_index, cell, cell_value;
    var profile = getWorkSheetProfile(ws);
    if (profile.isEmpty) {
        result.msg = '文件内容为空';
        return result;
    }

    var headerMapper = {
        "学号": "xuehao",
        "考号": "kaohao",
        "id": "id",
        "名字": "name",
        "姓名": "name",
        "班级": "class",
        "分组": "class",
        "class": "class"
    };

    var valueMap = {};
    //0行是title行
    for (var j = 0; j <= profile.maxCol; j++) {
        cell_index = XLSX.utils.encode_cell({r: 0, c: j});
        //确定单元格里有数据
        if (ws[cell_index]) {
            cell_value = ws[cell_index].v;
            if (headerMapper[cell_value]) {
                valueMap[j] = headerMapper[cell_value];
            }
        }
    }

    if(_.isEmpty(valueMap)){
        result.msg = '文件格式错误，没有表头';
        return result;
    }

    var students = [];
    for(var row = 1; row <= profile.maxRow; row++){

        var student = {};

        for(var col = 0; col <= profile.maxCol; col++){
            cell_index = XLSX.utils.encode_cell({r: row, c: col});
            //确定单元格里有数据
            if (ws[cell_index]) {
                cell_value = ws[cell_index].v;
                student[valueMap[col]] = cell_value;
            }
        }

        if(!_.isEmpty(student)){
            students.push(student);
        }

    }

    if(result.msg.length == 0){
        result.code = 0;
        result.data = students;
    }
    return result;
}
