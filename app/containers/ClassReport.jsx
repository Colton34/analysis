import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {Map} from 'immutable';

import CommonErrorView from '../common/ErrorView';
// import CommonLoadingView from '../common/LoadingView';
import Spinkit from '../common/Spinkit';
import ReportNavHeader from '../common/report/NavHeader';
import ReportTabNav from '../components/classReport/ReportTabNav';
import MultiClassReport from '../components/classReport/multiClassReport';
import SingleClassReport from '../components/classReport/singleClassReport';

import {initReportDSAction} from '../reducers/reportDS/actions';

import {initParams} from '../lib/util';

import {COLORS_MAP as colorsMap} from '../lib/constants';

class ContentComponent extends React.Component {
    constructor(props) {
        super(props);
        var realClasses = this.props.reportDS.examInfo.toJS().realClasses;
        this.ifCanReviewMultiReport = ifCanReviewMultiReport(this.props.user.auth, this.props.grade, this.props.reportDS.examInfo.toJS());
        this.authClasses = getAuthClasses(this.props.user.auth, this.props.grade, this.props.gradeName, realClasses);
        this.state = {
            reportType: 'single',
            currentClass: this.authClasses[0].key
        };
    }

    changeClassReport(item) {
        if(item.type == 'multi') {
            this.setState({
                reportType: item.type
            });
        } else {
            this.setState({
                reportType: item.type,
                currentClass: item.currentClass
            })
        }
    }
    render() {
        // var isSchoolManagerOrGradeManager = true;//TODO: 替换真实的判断
        var examName = this.props.reportDS.examInfo.toJS().name;
        var currentClass = this.state.currentClass;
        var authClassesList = this.authClasses;

        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader examName={examName} examId={this.props.examid} grade={this.props.grade} />
                {(this.ifCanReviewMultiReport) ? <ReportTabNav changeClassReport={this.changeClassReport.bind(this)} classesList={authClassesList} reportDS={this.props.reportDS} /> : ''}
                {(this.state.reportType == 'multi') ? <MultiClassReport reportDS={this.props.reportDS} />
                    : <SingleClassReport reportDS={this.props.reportDS} currentClass={currentClass} user={this.props.user} grade={this.props.grade} gradeName={this.props.gradeName}/>}
            </div>
        );
    }
}

class ClassReport extends React.Component {
    static need = [
        initReportDSAction
    ]

    componentDidMount() {
        if (this.props.reportDS.haveInit || this.props.isLoading) return; // this.props.isLoading  -- 应该不需要才对！是什么导致initReportDS调用了之后在没有reset props的前提下又进来了？
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initReportDS(params);
    }

    render() {

        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';//Note: grade用来区分是否是自定义分析，类似于一个isCustom的布尔值，从而走不通的server route path，gradeName是一定有值的--用来做显示，表明年级值。
        var gradeName = this.props.reportDS.examInfo.toJS().gradeName;
        if (!examid) return;

        var user = Map.isMap(this.props.user) ? this.props.user.toJS() : this.props.user;
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : ((this.props.isLoading || !this.props.reportDS.haveInit) ? <Spinkit /> : (
                    <ContentComponent reportDS={this.props.reportDS} user={user} examid={examid} grade={grade} gradeName={gradeName}/>
                ))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassReport);

function mapStateToProps(state) {
    return {
        isLoading: state.global.isLoading,
        ifError: state.global.ifError,
        user: state.global.user,
        reportDS: state.reportDS
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initReportDS : bindActionCreators(initReportDSAction, dispatch),
    }
}






function ifCanReviewMultiReport(auth, gradeKey, examInfo) {
    return ((!gradeKey && examInfo.from == '40') ||(gradeKey && (auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]))));
}

function getAuthClasses(auth, gradeKey, gradeName, realClasses) {
    //获取此页面需要的auth classes
    //如果是校级领导，年级主任，任意一门学科的学科组长，那么都将看到所有学生--因为这里涉及的自定义分析到选择学生页面没有学科的筛选了，就没办法和学科再联系一起了
    if(gradeKey && (auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]))) {
        return _.map(realClasses, (classKey) => {
            return {
                key: classKey,
                value: gradeKey + classKey + '班'
            }
        })
    }
    //Note: 是自定义--不属于自己管理的年级。自定义可能是没有gradeKey传递--是undefined
    if(!gradeKey || !auth.gradeAuth[gradeKey]) {
        return _.map(realClasses, (classKey) => {
            return {
                key: classKey,
                value: gradeName + classKey + '班'
            }
        })
    }

    return _.map(auth.gradeAuth[gradeKey].groupManagers, (obj) => {
        return {
            key: obj.group,
            value: gradeKey + obj.group + '班'
        }
    });
}



//=================================================  分界线  =================================================
