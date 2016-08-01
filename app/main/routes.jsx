import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../containers/App';
import Home from '../containers/Home';
import HelpCenter from '../components/HelpCenter';
import Dashboard from '../containers/Dashboard';
import RankReport from '../containers/RankReport';
import SchoolReport from '../containers/SchoolReport';
import CustomizeAnalysis from '../containers/CustomizeAnalysis';

import Test from '../containers/Test';
import Main from '../containers/main';
/*
    Note: 当Route内嵌的时候，使用相对path则会继承上一级的路由path，如果使用绝对path（即前面加上"/"），则不会继承上一级的path
 */
export default (store) => {
    return (
        <Route path="/" component={App}>
            <IndexRoute component={Main} />
            <Route path='test' component={Test} />
            <Route path='dashboard' component={Dashboard} />
            <Route path='school/report' component={SchoolReport} />
            <Route path='add/analysis' component={CustomizeAnalysis}/>
            <Route path='faq' component={HelpCenter}/>
            <Route path='rank/report' component={RankReport}/>
        </Route>
    );
};
