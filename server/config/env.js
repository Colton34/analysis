/*
* @Author: liucong
* @Date:   2016-03-31 11:23:27
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-12 17:31:30
*/

'use strict';

var development = {
    "db": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "port": 3000,
    "secret": "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    "alg": "HS256",
    "rankBaseUrl": 'http://ct.yunxiao.com:8156',
    "testRankBaseUrl": 'http://ct.yunxiao.com:8157',
    "yjServer": "http://testyue.yunxiao.com",
    "yj2Server": "http://ct.yunxiao.com:8110",
    "casServer": "http://testpassport.yunxiao.com"
    // redis: { port: 6380, host: 'ct.yunxiao.com', max_attempts : 10, auth_pass: 'yunxiao_redis_@xxx', connect_timeout: 50000 },
};

var production = {
    "db": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "port": 8666,
    "client_host": 'localhost',
    "secret": "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    "alg": "HS256",
    "rankBaseUrl": 'http://ct.yunxiao.com:8156',
    "testRankBaseUrl": 'http://ct.yunxiao.com:8157',
    "yjServer": "http://testyue.yunxiao.com",
    "yj2Server": "http://ct.yunxiao.com:8110",
    "casServer": "http://testpassport.yunxiao.com"
};

var test = {
    db: '',
    secret: ''
};


module.exports = {
    development: development,
    production: production,
    test: test
}[process.env.NODE_ENV] || ['development'];
