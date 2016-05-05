/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:04
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 20:38:38
*/

'use strict';

import gloablInitState from './global-app-state';
import homeInitState from './home-state';
import dashboardInitState from './dashboard-state';
import schoolAnalysisState from './school-analysis-state';

var _initState = {
    app: new gloablInitState,
    home: new homeInitState,
    dashboard: new dashboardInitState,
    schoolAnalysis: new schoolAnalysisState
};

export default _initState;
