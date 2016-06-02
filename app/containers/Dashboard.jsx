'use strict';

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Link, browserHistory} from 'react-router';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';

import ExamGuideComponent from '../components/dashboard/exam-guide';
import ScoreRank from '../components/dashboard/score-rank';
import LevelReport from '../components/dashboard/level-report';
import ClassReport from '../components/dashboard/class-report';
import SubjectReport from '../components/dashboard/subject-report';
import PaperComment from '../components/dashboard/paper-comment';
import PaperQuality from '../components/dashboard/paper-quality';
import StudentReport from '../components/dashboard/student-report';

import {initDashboardAction} from '../reducers/dashboard/actions';
import {convertJS, initParams} from '../lib/util';

import {Map, List} from 'immutable';

import dashboardStyle from '../components/dashboard/dashboard.css';

// 　Bgcolor:″＃F1FAFA″——做正文的背景色好，淡雅
// 　　Bgcolor:″＃E8FFE8″——做标题的背景色较好，与上面的颜色搭配很协调
// 　　Bgcolor:″＃E8E8FF″——做正文的背景色较好，文字颜色配黑色
// 　　Bgcolor:″＃8080C0″——上配黄色白色文字较好
// 　　Bgcolor:″＃E8D098″——上配浅蓝色或蓝色文字较好
// 　　Bgcolor:″＃EFEFDA″——上配浅蓝色或红色文字较好
// 　　Bgcolor:″＃F2F1D7″——配黑色文字素雅，如果是红色则显得醒目
// 　　
// 　　
// 　　Bgcolor:″＃336699″——配白色文字好看些  -- 蓝色
// 　　
// 　　
// 　　Bgcolor:″＃6699CC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃66CCCC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃B45B3E″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃479AC7″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃00B271″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃FBFBEA″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃D5F3F4″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃D7FFF0″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃F0DAD2″——配黑色文字比较好看，一般作为正文
// 　　Bgcolor:″＃DDF3FF″——配黑色文字比较好看，一般作为正文

//   #f5f5dc   #ffe4c4

@Radium
class Dashboard extends React.Component {
    static need = [
        initDashboardAction
    ];

    componentDidMount() {
        if (this.props.dashboard.haveInit) return;

        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        this.props.initDashboard(params);
    }

    toViewSchoolAnalysis() {
        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
        if (!examid || !grade) return;
        browserHistory.push('/school/report?examid=' + examid + '&grade=' + encodeURI(grade));
    }

    render() {
        var examInfoGuide = (Map.isMap(this.props.dashboard.examInfoGuide)) ? this.props.dashboard.examInfoGuide.toJS() : this.props.dashboard.examInfoGuide;
        var scoreRank = (Map.isMap(this.props.dashboard.scoreRank)) ? this.props.dashboard.scoreRank.toJS() : this.props.dashboard.scoreRank;
        var levelScoreReport = (Map.isMap(this.props.dashboard.levelScoreReport)) ? this.props.dashboard.levelScoreReport.toJS() : this.props.dashboard.levelScoreReport;
        var classScoreReport = (Map.isMap(this.props.dashboard.classScoreReport)) ? this.props.dashboard.classScoreReport.toJS() : this.props.dashboard.classScoreReport;

// debugger;


        if ((!examInfoGuide || _.size(examInfoGuide) == 0) || (!scoreRank || _.size(scoreRank) == 0) ||
            (!levelScoreReport || _.size(levelScoreReport) == 0) || (!classScoreReport || _.size(classScoreReport) == 0)) return (<div></div>);



        return (
            <div>
                <div style={{ height: 40, width: 1200, backgroundColor: '#f2f2f2',  margin: '35px auto 20px auto', paddingLeft: 20,fontSize: 16 , color: '#333'}}>
                    <a href='/' style={styles.dashboardTitleName}>
                        {String.fromCharCode(60)} 遵义清华中学2016年1月月考
                    </a>
                </div>
                <div style={[styles.box, styles.common.radius]}>
                    <div style={[styles.container, styles.common.radius]}>
                        <ExamGuideComponent data={examInfoGuide} />
                        <ScoreRank data={scoreRank} />
                        <div key="test"   style={{cursor: 'pointer'}}className={dashboardStyle['card']} onClick={this.toViewSchoolAnalysis.bind(this) }>
                            <div className={dashboardStyle['card-title']}>学校成绩总报告</div>
                            <div className={dashboardStyle['analysis-report'] + ' ' + dashboardStyle['card-image']}></div>
                            <div className={dashboardStyle['detail-btn']}>查看详情</div>
                        </div>
                    </div>
                    <div style={[styles.container, styles.common.radius]}>
                        <LevelReport data={levelScoreReport} />
                        <div className={dashboardStyle['card']}>
                            <div className={dashboardStyle['card-title']}>班级分析报告</div>
                            <ClassReport data={classScoreReport}/>
                        </div>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>学科数据报告</div>
                            <div className={dashboardStyle['subject-data'] + ' ' + dashboardStyle['card-image']} style={{ marginTop: 20 }}></div>
                            <div className={dashboardStyle['detail-btn']}>查看详情</div>
                        </div>
                    </div>
                    <div style={[styles.container, styles.common.radius]}>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>学生个人报告</div>
                            <StudentReport/>
                        </div>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>知识点分析情况</div>
                            <div className={dashboardStyle['knowledge-point'] + ' ' + dashboardStyle['card-image']} style={{ marginTop: 20 }}></div>
                            <div style={{ fontSize: 5, color: '#a2a2a2', position: 'absolute', bottom: 0, margin: '0 0 10px 10px' }}>查看知识点对不同学业水平学生的区分能力</div>
                            <div className={dashboardStyle['detail-btn']}>查看详情</div>
                        </div>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>试卷质量分析</div>
                            <PaperQuality/>
                        </div>
                    </div>
                    <div style={[styles.container, styles.common.radius]}>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>试卷讲评</div>
                            <PaperComment />
                        </div>
                        <div className={dashboardStyle.card}>
                            <div className={dashboardStyle['card-title']}>老师个人报告</div>
                            <div className={dashboardStyle['teacher-report'] + ' ' + dashboardStyle['card-image']}  style={{ marginTop: 20 }}></div>
                            <div className={dashboardStyle['detail-btn']}>查看详情</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

function mapStateToProps(state) {
    return {
        dashboard: state.dashboard
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initDashboard: bindActionCreators(initDashboardAction, dispatch)
    }
}

var styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    box: { height: 1350, width: 1200, backgroundColor: '#f2f2f2', display: 'flex', alignContent: 'space-around', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', margin: '0 auto' },
    container: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'nowrap' },
    item: { height: 320, backgroundColor: '#fff', flexGrow: 1, color: '#333', borderRadius: 15 },
    cardImage: { width: '85%', height: '65%', margin: '0 auto' },
    scalZoom: {
        ':hover': {
            backgroundColor: 'black'
        }
    },
    dashboardTitleName: {
        textDecoration: 'none',
        color: '#333',
        ':hover': {textDecoration: 'none', color: '#333'}
    }
}


// .grow { transition: all .2s ease-in-out; }
// .grow:hover { transform: scale(1.1); }
