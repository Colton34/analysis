/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 16:05:21
*/

'use strict';

//设计：输出combineReducers的RootReducer

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

//自定义reducer
import app from './global-app';
import dashboard from './dashboard';
import schoolAnalysis from './schoolAnalysis';

var rootReducer = combineReducers({
    app,
    dashboard,
    schoolAnalysis,
    routing
});

export default rootReducer;
