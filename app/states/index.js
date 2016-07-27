/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:04
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-14 18:10:37
*/

'use strict';

import gloablInitState from './global-app-state';
import homeInitState from './home-state';
import dashboardInitState from './dashboard-state';
import schoolAnalysisState from './school-analysis-state';
import customAnalysisState from './custom-analysis-state';
import rankReportState from './rank-report-state';

var _initState = {
    app: new gloablInitState,
    home: new homeInitState,
    dashboard: new dashboardInitState,
    rankReport: new rankReportState,
    schoolAnalysis: new schoolAnalysisState,
    customAnalysis: new customAnalysisState
};

export default _initState;
