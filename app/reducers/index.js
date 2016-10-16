/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-15 11:59:45
*/

'use strict';

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import app from './global-app';
import home from './home';
import rankReport from './rankReport';
import dashboard from './dashboard';
import customAnalysis from './customAnalysis';
import reportDS from './reportDS';
import classReport from './classReport';
import examsCache from './examsCache';
import helper from './helper';
import zouban from './zouban';

import {one, two} from './test';

var rootReducer = combineReducers({
    global: app,
    home,
    dashboard,
    reportDS,
    rankReport,
    classReport,
    customAnalysis,
    examsCache,
    helper,
    zouban,
    //设计成嵌套的reducer
    test: combineReducers({
        one,
        two
    }),
    routing,
});

export default rootReducer;
