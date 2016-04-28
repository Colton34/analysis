/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:04
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 18:47:05
*/

'use strict';

import gloablInitState from './global-app-state';
import dashboardInitState from './dashboard-state';



var _initState = {
    app: new gloablInitState,
    dashboard: new dashboardInitState
};

export default _initState;
