/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 15:32:32
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

var rootReducer = combineReducers({
    global: app,
    home,
    dashboard,
    reportDS,
    rankReport,
    customAnalysis,
    routing
});

export default rootReducer;
