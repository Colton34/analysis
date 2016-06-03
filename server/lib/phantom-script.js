/*
* @Author: HellMagic
* @Date:   2016-06-01 15:23:57
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-03 12:40:18
*/

'use strict';

var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

var cmdArgs = [
    'url',
    'token',
    'filepath'
];

var args = {};
cmdArgs.map(function(name, i) {
    args[name] = system.args[i+1];
});

page.customHeaders = {
    "x-access-token": args.token
};

page.onInitialized = function() {
    page.customHeaders = {};
};

//TODO: 这里写死了hostname是因为phantomjs对于当前项目压缩混淆后的代码执行不能正确渲染，所以要单独启动一个没有压缩混淆后的
//server来支持渲染（当然可以使用简单的webserver来做临时渲染server，但这里方便直接使用了原工程webserver，而且自带auth）
page.open('http://localhost:3000'+args.url, function(status) {
    if(status == 'fail') {
        page.close();
        phantom.exit(1);
        return;
    }

    setTimeout(function() {
        page.render(args.filepath);
        console.log(args.filepath);
        page.close();
        phantom.exit();
    }, 1000 * 10)
});
