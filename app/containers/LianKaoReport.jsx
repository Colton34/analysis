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
// import ReportTabNav from '../components/liankaoReport/ReportTabNav';
import MultiSchoolReport from '../components/liankao/multiSchoolReport';
// import SingleClassReport from '../components/liankaoReport/singleClassReport';
import {initReportDSAction} from '../reducers/reportDS/actions';

import {initParams} from '../lib/util';

import {COLORS_MAP as colorsMap} from '../lib/constants';

class ContentComponent extends React.Component {
    constructor(props) {
        super(props);
        //TODO: 要么看到所有学校，要么就是当前一个学校？
        this.ifCanReviewMultiReport = ifCanReviewMultiReport(this.props.user.auth, this.props.grade, this.props.reportDS.examInfo.toJS());


        // var realClasses = this.props.reportDS.examInfo.toJS().realClasses;
        // this.ifCanReviewMultiReport = ifCanReviewMultiReport(this.props.user.auth, this.props.grade, this.props.reportDS.examInfo.toJS());
        // this.authClasses = getAuthClasses(this.props.user.auth, this.props.grade, this.props.gradeName, realClasses);
        // this.state =
        //     reportType: 'single',
        //     currentClass: this.authClasses[0].key
        // };
    }

    changeSchoolReport(item) {
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
//         console.log('examName = ', examName);
// debugger;

        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader examName={examName} examId={this.props.examid} grade={this.props.grade} reportName={'联考分析报告'}/>
                {/* {(this.ifCanReviewMultiReport) ? <ReportTabNav changeSchoolReport={this.changeClassReport.bind(this)} schoolList={authSchoolsList} reportDS={this.props.reportDS} /> : ''}  //【暂时】没有单个学校联考报告 */}
                <MultiSchoolReport reportDS={this.props.reportDS} examId={this.props.examid} grade={this.props.grade} />
                {/* {(this.state.reportType == 'multi') ? <MultiClassReport reportDS={this.props.reportDS} />
            : <SingleClassReport reportDS={this.props.reportDS} currentClass={currentClass} user={this.props.user} grade={this.props.grade} gradeName={this.props.gradeName} ifCanReviewMultiReport={this.ifCanReviewMultiReport}/>} */}
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
        if (!examid || !grade) return;
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : ((this.props.isLoading || !this.props.reportDS.haveInit) ? <Spinkit /> : (
                    <ContentComponent examid={examid} grade={grade} reportDS={this.props.reportDS} user={this.props.user} />
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
    //TODO：如果是特殊教育局角色
    return true;
}

function getAuthSchool(auth, gradeKey, gradeName, realClasses) {
    // if(gradeKey && (auth.isSchoolManager || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey]))) {
    //     return _.map(realClasses, (classKey) => {
    //         return {
    //             key: classKey,
    //             value: gradeKey + classKey + '班'
    //         }
    //     })
    // }
    // if(!gradeKey || !auth.gradeAuth[gradeKey]) {
    //     return _.map(realClasses, (classKey) => {
    //         return {
    //             key: classKey,
    //             value: gradeName + classKey + '班'
    //         }
    //     })
    // }

    // return _.map(auth.gradeAuth[gradeKey].groupManagers, (obj) => {
    //     return {
    //         key: obj.group,
    //         value: gradeKey + obj.group + '班'
    //     }
    // });
}
