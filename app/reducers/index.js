/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 10:02:57
*/

'use strict';

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import app from './global-app';
import home from './home';
import dashboard from './dashboard';
import schoolAnalysis from './schoolAnalysis';
import customAnalysis from './customAnalysis';
import rankReport from './rankReport';

var rootReducer = combineReducers({
    app,
    home,
    dashboard,
    schoolAnalysis,
    customAnalysis,
    rankReport,
    routing
});

export default rootReducer;
