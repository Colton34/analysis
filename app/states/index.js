/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:04
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 13:53:57
*/

'use strict';

import gloablInitState from './global-app-state';
import homeInitState from './home-state';
import dashboardInitState from './dashboard-state';
import reportDS from './report-state';
import rankReportState from './rank-report-state';
import schoolAnalysisState from './school-analysis-state';
import customAnalysisState from './custom-analysis-state';

var _initState = {
    global: new gloablInitState,
    home: new homeInitState,
    dashboard: new dashboardInitState,
    reportDS: new reportDS,
    rankReport: new rankReportState,
    schoolAnalysis: new schoolAnalysisState,
    customAnalysis: new customAnalysisState
};

export default _initState;
