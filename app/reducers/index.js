/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:10
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 18:30:57
*/

'use strict';

//设计：输出combineReducers的RootReducer

import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

//自定义reducer
import app from './global-app';
import dashboard from './dashboard';

var rootReducer = combineReducers({
    app,
    dashboard,
    routing
});

export default rootReducer;
