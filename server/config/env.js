/*
* @Author: liucong
* @Date:   2016-03-31 11:23:27
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-28 19:16:52
*/

'use strict';

var development = {
    "analysisServer"    : "http://fx-engine.yunxiao.com", //http://fx-engine.yunxiao.com   http://ct.yunxiao.com:8158
    'fxdb': 'mongodb://fx2:123456@ct.yunxiao.com:19000/fx2',
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "port": 3000,
    "secret": "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    "alg": "HS256",
    "yjServer": "http://yj.yunxiao.com",//   http://testyue.yunxiao.com  【注意：区分development下连接的是测试地址还是生产地址】
    "yj2Server": "http://yue.haofenshu.com",  //http://ct.yunxiao.com:8110
    "casServer": "http://passport.yunxiao.com", // http://testpassport.yunxiao.com
    "hfsServer": "http://hfs-be.yunxiao.com",
    "client_host": 'localhost'
};

var test = {
    "analysisServer"    : "http://ct.yunxiao.com:8158",
    'fxdb': 'mongodb://fx2:123456@ct.yunxiao.com:19000/fx2',
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "port": 8666,
    "client_host": 'localhost',
    'render_host': 'testrender.yunxiao.com',
    "secret": "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    "alg": "HS256",
    "yjServer": "http://yj.yunxiao.com",
    "yj2Server": "http://yue.haofenshu.com",
    "casServer": "http://passport.yunxiao.com",
    "hfsServer": "http://hfs-be.yunxiao.com"
};

var production = {
    "analysisServer"    : "http://fx-engine.yunxiao.com",
    'fxdb': 'mongodb://hfsfenxi:%5D%237UXrz%5Bjq98@server4-ks.yunxiao.com:8300/hfsfenxi',
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://read:%3A_3IJon%3Cbb08@server4-ks.yunxiao.com:8300/analy4',  //mongodb://localhost:27017/hfs-test
    "port": 8666,
    "client_host": 'localhost',
    'render_host': 'testrender.yunxiao.com',
    "secret": "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF",
    "alg": "HS256",
    "yjServer": "http://yj.yunxiao.com",
    "yj2Server": "http://yue.haofenshu.com",
    "casServer": "http://passport.yunxiao.com",
    "hfsServer": "http://hfs-be.yunxiao.com"
};

module.exports = {
    development: development,
    production: production,
    test: test
}[process.env.NODE_ENV] || ['development'];

/*
注销HFS DB Connection:
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://fx:fx123456@server4.yunxiao.com:8300/hfs-test',  //mongodb://localhost:27017/hfs-test
    "hfsdb": process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://read:%3A_3IJon%3Cbb08@server4-ks.yunxiao.com:8300/analy4',  //mongodb://localhost:27017/hfs-test

    "rankBaseUrl": 'http://fenxi-be.haofenshu.com',

    "testRankBaseUrl": 'http://fenxi-be.haofenshu.com',
 */
