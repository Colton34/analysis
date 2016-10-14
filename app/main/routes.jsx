import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../containers/App';
import Home from '../containers/Home';
import HelpCenter from '../components/HelpCenter';
import Dashboard from '../containers/Dashboard';
import RankReport from '../containers/RankReport';
import LianKaoReport from '../containers/LianKaoReport';
import SchoolReport from '../containers/SchoolReport';
import ClassReport from '../containers/ClassReport';
import SubjectReport from '../containers/SubjectReport';
import CustomizeAnalysis from '../containers/CustomizeAnalysis';

import HelperBox from '../containers/HelperBox';
import HelperBoxContainer from '../containers/HelperBoxContainer';
import EquivalentScore from '../components/Helper/EquivalentScore';

import Zouban from '../containers/Zouban';
import ZoubanQuestionModule from '../components/zouban/QuestionModule';
import ScoreDetailModule from '../components/zouban/ScoreDetailModule';
// import ZoubanQuestionContainer from '../containers/Zouban/QuestionContainer';

import Test from '../containers/Test';
import Main from '../containers/main';
/*
    Note: 当Route内嵌的时候，使用相对path则会继承上一级的路由path，如果使用绝对path（即前面加上"/"），则不会继承上一级的path
*/
//Note: 是否需要再重新规划一下路由：关于grade等在path中的传参问题
export default (store) => {
    return (
        <Route path="/" component={App}>
            <IndexRoute component={Main} />
            <Route path='home' component={Home}/>
            <Route path='faq' component={HelpCenter}/>
            <Route path='helper' component={HelperBox} />
            <Route path='dashboard' component={Dashboard} />
            <Route path='liankao/report' component={LianKaoReport} />
            <Route path='school/report' component={SchoolReport} />
            <Route path='rank/report' component={RankReport}/>
            <Route path='class/report' component={ClassReport} />
            <Route path='subject/report' component={SubjectReport} />
            <Route path='add/analysis' component={CustomizeAnalysis}/>
            <Route path='zouban' component={Zouban}>
                <Route path="question" component={ZoubanQuestionModule} />
                <Route path="detail" component={ScoreDetailModule} />
            </Route>
            <Route path='helper/:name' component={HelperBoxContainer}>
                <Route path="score" component={EquivalentScore} />
            </Route>
        </Route>
    );
};
