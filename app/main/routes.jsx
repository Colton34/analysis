import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../containers/App';
import Dashboard from '../containers/Dashboard';
import Test from '../containers/Test'
import Home from '../containers/Home';
import SchoolReport from '../containers/SchoolReport';
import CustomizeAnalysis from '../containers/CustomizeAnalysis';
import HelpCenter from '../components/HelpCenter';
import RankReport from '../containers/RankReport';

import ClassReport from '../containers/ClassReport';
/*
    Note: 当Route内嵌的时候，使用相对path则会继承上一级的路由path，如果使用绝对path（即前面加上"/"），则不会继承上一级的path
 */
//Note: 是否需要再重新规划一下路由：关于grade等在path中的传参问题
export default (store) => {
    return (
        <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path='faq' component={HelpCenter}/>
            <Route path='add/analysis' component={CustomizeAnalysis}/>
            <Route path='dashboard' component={Dashboard} />
            <Route path='rank/report' component={RankReport}/>
            <Route path='school/report' component={SchoolReport} />
            <Route path='class/report' component={ClassReport} />
        </Route>
    );
};
