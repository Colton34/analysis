/*
* @Author: liucong
* @Date:   2016-03-31 11:19:09
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-13 20:14:07
*/

'use strict';

var fs = require("fs");
var url = require('url');
var path = require("path");
var when = require('when');
var express = require('express');
var engines = require('consolidate');
var unless = require('express-unless');
var bodyParser = require("body-parser");
var onFinished = require('on-finished');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');

var config = require("./env");
var rootPath = path.join(__dirname, '..', '..', 'index.html');

var http_port = process.env.HTTP_PORT || config.port;

var debug = require('debug')('app:' + process.pid);

var compiled_app_module_path = path.resolve(__dirname, '../../', 'public', 'assets', 'server.js');
var App = require(compiled_app_module_path);

var peterHFS = require('peter').getManager('hfs');
var peterFX = require('peter').getManager('fx');

var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectId;

var auth = require('../middlewares/auth');

module.exports = function(app) {
    var hsfPromise = bindHFS();
    var fxPromise = bindFX();
    when.all([hsfPromise, fxPromise]).then(function(msgArr) {
        console.log('msgArr :  ', msgArr);
        try {
            initWebServer(app);
        } catch(e) {
            console.log('Init WebServer Error: ', e);
            process.exit(1);
        }
    }).catch(function(err) {
        console.log('Bind DB Error: ', err);
        process.exit(1);
    });
}

function bindHFS() {
    return when.promise(function(resolve, reject) {
        peterHFS.bindDb(config.hfsdb, function(error) {
            if(error) {
                console.log('bind Error : ', error);
                return reject(error);
            }
            resolve('success bind HFS');
        });
    });
}

function bindFX() {
    return when.promise(function(resolve, reject) {
        peterFX.bindDb(config.fxdb, function(error) {
            if(error) {
                console.log('bind again error: ', error);
                return reject(error);
            }
            resolve('success bind FX');
        });
    });
}

function initWebServer(app) {
    app.use(require('morgan')("dev"));

    //为了对login的时候使用cookie来存储token
    app.use(cookieParser());

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.use(expressValidator());

    app.use(express.static(path.join(__dirname, '../..', 'public')));

    app.engine('html', engines.swig);
    app.engine('jade', engines.jade);
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, '../..', 'server/views'));

    app.use(require('compression')());
    app.use(require('response-time')());

    app.use(function (req, res, next) {

        onFinished(res, function (err) {
            debug("[%s] finished request", req.connection.remoteAddress);
        });

        next();

    });

    app.use(require('../routes/unless'));
    app.use(auth.verify);
    // Bootstrap routes（会添加各个版本不同的路由）
    require('../routes/v1')(app);
    // ...其他版本的路由
    app.all("*", function (req, res, next) {
        App(req, res);
    });

    // error handler for all the applications
    app.use(function (err, req, res, next) {
        var code = err.status || 500;
        switch (err.name) {
            case "HttpStatusError":
                if(code == 401 && err.message && (err.message.errorCode == 1 || err.message.errorCode == 2)) {
                    console.log('成功返回错误信息');
                    return res.status(200).json(err.message);
                }
                if(code == 400) {
                    console.log('重定向');
                    return res.redirect('/login');
                }
                if(code == 401 && err.message && err.message.errorCode == 3) {
                    console.log('重定向');
                    return res.redirect('/login');
                }
                break;
            default:
                break;
        }

        if(code === 500) {
            //For Debugg
            console.log('服务端Error', err);
        }

        return res.status(code).json(err);
    });

    debug("Creating HTTP server on port: %s", http_port);
    require('http').createServer(app).listen(http_port, function () {
        debug("HTTP Server listening on port: %s, in %s mode", http_port, app.get('env'));
    });
}
