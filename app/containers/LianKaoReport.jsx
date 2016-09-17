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
        // var realClasses = this.props.reportDS.examInfo.toJS().realClasses;
        // this.ifCanReviewMultiReport = ifCanReviewMultiReport(this.props.user.auth, this.props.grade, this.props.reportDS.examInfo.toJS());
        // this.authClasses = getAuthClasses(this.props.user.auth, this.props.grade, this.props.gradeName, realClasses);
        // this.state = {
        //     reportType: 'single',
        //     currentClass: this.authClasses[0].key
        // };
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
        console.log('examName = ', examName);
debugger;

        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                联考报告
            </div>
        );
    }
}

class LianKaoReport extends React.Component {
    static need = [
        initReportDSAction
    ]

    componentDidMount() {
        if (this.props.reportDS.haveInit || this.props.isLoading) return;
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initReportDS(params);
    }

    render() {

        var examid = this.props.location.query ? this.props.location.query.examid : '';
        var grade = this.props.location.query ? this.props.location.query.grade : '';
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

export default connect(mapStateToProps, mapDispatchToProps)(LianKaoReport);

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
    if(gradeKey && (auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]))) {
        return _.map(realClasses, (classKey) => {
            return {
                key: classKey,
                value: gradeKey + classKey + '班'
            }
        })
    }
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
