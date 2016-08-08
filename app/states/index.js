/*
* @Author: HellMagic
* @Date:   2016-04-08 17:02:04
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-04 12:56:50
*/

'use strict';

import gloablInitState from './global-app-state';
import homeInitState from './home-state';
import dashboardInitState from './dashboard-state';
import reportDS from './report-state';
import rankReportState from './rank-report-state';
import classReportState from './class-report-state';
import customAnalysisState from './custom-analysis-state';

import {initOne, initTwo} from './test-state';

var _initState = {
    global: new gloablInitState,
    home: new homeInitState,
    dashboard: new dashboardInitState,
    reportDS: new reportDS,
    rankReport: new rankReportState,
    classReport: new classReportState,
    customAnalysis: new customAnalysisState,
    //设计成使用嵌套的reducer
    test: {
        one: initOne,
        two: initTwo
    }
};

export default _initState;
