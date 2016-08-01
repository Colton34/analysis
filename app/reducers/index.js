/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-01 15:48:14
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

import {one, two} from './test';

var rootReducer = combineReducers({
    app,
    home,
    dashboard,
    schoolAnalysis,
    customAnalysis,
    rankReport,
    routing,
    test: combineReducers({
        one,
        two
    })
});

export default rootReducer;
