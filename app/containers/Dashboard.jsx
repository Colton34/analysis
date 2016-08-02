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
import SchoolReport from '../components/dashboard/school-report';

import {initDashboardAction} from '../reducers/dashboard/actions';
import {initParams} from '../lib/util';

import {Map, List} from 'immutable';

import dashboardStyle from '../components/dashboard/dashboard.css';
import Spinkit from '../common/Spinkit';
import commonStyles from '../common/common.css';
import { Modal } from 'react-bootstrap';
import {FROM_FLAG, FROM_CUSTOM_TEXT, COLORS_MAP as colorsMap} from '../lib/constants';

var {Header, Title, Body, Footer} = Modal;

var examPath = "/exam";
var customBaseUrl = examPath + '/custom/analysis';

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
    constructor(props) {
        super(props);
        this.state = {
            showConfirmDialog: false,
            loading: false
        }
    }
    componentDidMount() {
        if (this.props.dashboard.haveInit) return;

        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initDashboard(params);
    }

    toViewSchoolAnalysis() {
        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
        if (!examid) return;
        var targetUrl = grade ? '/school/report?examid=' + examid + '&grade=' + grade : '/school/report?examid=' + examid;
        browserHistory.push(targetUrl);
    }

    onDeleteAnalysis() {
        this.setState({
            showConfirmDialog: false,
            loading: true
        })
        var _this = this;
        var examid = this.props.location.query.examid;
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        params.request.put(customBaseUrl, {examId: examid}).then(function(res) {
            location.href = '/';
        }).then(function(err) {
            console.log('Dashboard error : ', err);
        })
    }
    onShowDialog() {
        this.setState({
            showConfirmDialog: true
        })
    }
    onHideDialog() {
        this.setState({
            showConfirmDialog: false
        })
    }
    render() {
        var examInfoGuide = (Map.isMap(this.props.dashboard.examInfoGuide)) ? this.props.dashboard.examInfoGuide.toJS() : this.props.dashboard.examInfoGuide;
        var scoreRank = (Map.isMap(this.props.dashboard.scoreRank)) ? this.props.dashboard.scoreRank.toJS() : this.props.dashboard.scoreRank;
        var schoolReport = (Map.isMap(this.props.dashboard.schoolReport)) ? this.props.dashboard.schoolReport.toJS() : this.props.dashboard.schoolReport;

        // var levelScoreReport = (Map.isMap(this.props.dashboard.levelScoreReport)) ? this.props.dashboard.levelScoreReport.toJS() : this.props.dashboard.levelScoreReport;
        // var classScoreReport = (Map.isMap(this.props.dashboard.classScoreReport)) ? this.props.dashboard.classScoreReport.toJS() : this.props.dashboard.classScoreReport;
        var examid = this.props.location.query ? this.props.location.query.examid : '';
        if(!examid) return;
        var grade = this.props.location.query.grade || '';
        if (this.state.loading)
            //(!levelScoreReport || _.size(levelScoreReport) == 0) || (!classScoreReport || _.size(classScoreReport) == 0)
            return (
                <div style={{width: '100%', minHeight: 900, position: 'relative'}}>
                    <Spinkit/>
                 </div>
            );
        return (
            <div style={{width: 1200, margin: '0 auto'}} className='container'>
                {
                    _.size(examInfoGuide) === 0 && _.size(scoreRank) === 0 && _.size(schoolReport) === 0 ? (
                        <div>
                            <div style={{ height: 40, lineHeight: '40px', backgroundColor: '#EFF1F4', margin: '10px auto 10px 0', fontSize: 16, color: '#333' }}>
                                <Link to={{ pathname: '/' }} style={styles.dashboardTitleName}><i className='icon-fanhui2' style={{ color: '#59bde5' }}></i></Link>
                                <span style={{ fontSize: 14, color: '#333', marginLeft: 20 }}><a style={{ color: '#b4b4b4' }} href='/'>{'首页'}</a></span>
                            </div>
                            <div style={{ backgroundColor: '#fff', width: 1200, height: 650, display: 'table-cell', textAlign: 'center', verticalAlign: 'middle' }}>
                                <div className={commonStyles['blank-list']} style={{ margin: '0 auto', marginBottom: 30 }}></div>
                                <p style={{ color: colorsMap.C10, fontSize: 18, marginBottom: 30 }}>好桑心，您无法查看分析详情</p>
                                <p style={{ color: colorsMap.C09 }}>您的角色、年级、班级、学科等基础信息与系统不匹配，请尽快联系管理员老师确认。</p>
                            </div>
                        </div>
                    ) : (
                            <div>
                                <div style={{ height: 40, lineHeight: '40px', backgroundColor: '#EFF1F4', margin: '10px auto 10px -15px', fontSize: 16, color: '#333' }}>
                                    <Link to={{ pathname: '/' }} style={styles.dashboardTitleName}><i className='icon-fanhui2' style={{ color: '#59bde5' }}></i></Link>
                                    <span style={{ fontSize: 14, color: '#333', marginLeft: 20 }}><a style={{ color: '#b4b4b4' }} href='/'>{'首页'}<i className='icon-right-open-2'></i></a> {examInfoGuide.name}</span>
                                    {
                                        FROM_FLAG[this.props.dashboard.examInfoGuide['from']] === FROM_CUSTOM_TEXT ?
                                            <a key='delAnalysisBtn' href='javascript:;' onClick={this.onShowDialog.bind(this) } style={styles.aBtn}>
                                                <i className='icon-delete'></i>删除
                                            </a> : ''
                                    }
                                </div>
                                {(examInfoGuide && _.size(examInfoGuide) > 0) ? <ExamGuideComponent data={examInfoGuide} /> : ''}
                                <div className='row' style={{ marginTop: 20 }}>
                                    {(scoreRank && _.size(scoreRank) > 0) ? <ScoreRank data={scoreRank} examid={examid} grade={grade} expand={_.size(schoolReport) === 0 ? true : false}/> : ''}
                                    {(schoolReport && _.size(schoolReport) > 0) ? <SchoolReport examid={examid} grade={grade} data={schoolReport}/> : ''}
                                </div>
                                {/* */}
                                <div className='row' style={{ marginTop: 20 }}>
                                    <LevelReport />
                                    <SubjectReport />
                                    <ClassReport />
                                </div>
                                <Dialog show={this.state.showConfirmDialog} onHide={this.onHideDialog.bind(this) } onConfirm={this.onDeleteAnalysis.bind(this) }/>
                        </div>
                    )
                }
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

const Dialog = ({show, onHide, onConfirm}) => {
    return (
        <Modal show={ show } onHide={onHide} bsSize='sm'>
            <Header closeButton={true} style={{fontWeight: 'bold', textAlign: 'center'}}>提示</Header>
            <Body style={{textAlign:'center'}}>
                确定删除当前自定义分析？
            </Body>
            <Footer style={{textAlign: 'center'}}>
                <a id='confirmDel' href="javascript:void(0)" style={styles.btn} onClick={onConfirm}>删除</a>
            </Footer>
        </Modal>
    )
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
        textDecoration: 'none',display: 'inline-block', width: 10, height: 10,
        ':hover': {textDecoration: 'none', color: '#333'}
    },
    aBtn: {
        textDecoration: 'none', float: 'right', fontSize: 12, color: '#ee6b52',
        ':hover': {textDecoration: 'none', color: '#de5d44'}
    },
    btn: {lineHeight: '34px', width: 54, height: 34,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#ee6b52',margin: '0 30px', color: '#fff', borderRadius: '4px'},
}


// .grow { transition: all .2s ease-in-out; }
// .grow:hover { transform: scale(1.1); }
