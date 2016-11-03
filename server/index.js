




var fs = require('fs');
var express = require('express');
var webpack = require('webpack');
var config = require('./config/env');

var app = express();

var isDev = process.env.NODE_ENV === 'development';
if (isDev) {
    var wpconfig = require('../webpack/webpack.config.dev-client.js');
    var compiler = webpack(wpconfig);
    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: wpconfig.output.publicPath
    }));

    app.use(require('webpack-hot-middleware')(compiler));
}

require('./config/express')(app);
