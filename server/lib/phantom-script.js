/*
* @Author: HellMagic
* @Date:   2016-06-01 15:23:57
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-06-02 14:30:34
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

//这里 url要指定正确的 hostname和port -- 但是hostname是不是只要是localhost就可以了？因为脚本执行的地方肯定是server所在的地方
var host = 'http://localhost:3000';

page.open(host+args.url, function(status) {
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
