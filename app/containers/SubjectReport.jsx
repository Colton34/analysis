import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import ReportContent from '../components/subjectReport';
import CommonErrorView from '../common/ErrorView';
// import CommonLoadingView from '../common/LoadingView';
import Spinkit from '../common/Spinkit';

import {initReportDSAction} from '../reducers/reportDS/actions';
import {initParams} from '../lib/util';
import {COLORS_MAP as colorsMap} from '../lib/constants';

class SubjectsNav extends React.Component {
    render() {
        return (
            <div>
                {
                    _.map(this.props.authSubjects, (obj) => {
                        return (
                            <button onClick={this.props.changeSubject.bind(null, obj)}>{obj.subject}</button>
                        )
                    })
                }
            </div>
        );
    }
}


class ContentComponent extends React.Component {
    constructor(props) {
        super(props);
        this.authSubjects = getAuthSubjects(this.props.user.toJS().auth, this.props.reportDS.examInfo.toJS(), this.props.reportDS.headers.toJS());
        this.ifShowSubjectNav = (this.authSubjects.length > 1);
        this.state = {
            currentSubject: this.authSubjects[0]
        };
    }

    onChangeSubject(subjectObj) {
        this.setState({
            currentSubject: subjectObj
        })
    }

    render() {
        // this.ifExistSubject = (this.authSubjects.length > 0);
        // {(this.ifExistSubject) ? (<ReportContent authSubjects={this.authSubjects} reportDS={this.props.reportDS} />) : (<h1>没有您所管辖的学科</h1>)}
        var authSubjects = this.authSubjects;
        if(authSubjects.length == 0) return;

        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                {(this.ifShowSubjectNav) ? (<SubjectsNav authSubjects={authSubjects} changeSubject={this.onChangeSubject.bind(this)} />) : ''}
            </div>
        );
    }
}

class SubjectReport extends React.Component {
    static need = [
        initReportDSAction
    ]

    componentDidMount() {
        if (this.props.reportDS.haveInit || this.props.isLoading) return;
        //TODO:在query中传递是否是isCustom，而不是通过是否有grade来判断是不是自定义分析。
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initReportDS(params);
    }

    render() {
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : ((this.props.isLoading || !this.props.reportDS.haveInit) ? <Spinkit /> : (
                    <ContentComponent reportDS={this.props.reportDS} user={this.props.user} />
                ))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubjectReport);

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

function getAuthSubjects(auth, examInfo, headers) {
    if(examInfo.from == '40' || (auth.isSchoolManager) || (_.isBoolean(auth.gradeAuth[gradeKey]) && auth.gradeAuth[gradeKey])) {
        return _.map(_.slice(headers, 1), (obj) => {
            return {
                subject: obj.subject,
                pid: obj.id
            }
        })
    } else if(auth.gradeAuth.subjectManagers && auth.gradeAuth.subjectManagers.length > 0) {
        var authSubjects = _.map(auth.gradeAuth.subjectManagers, (obj) => obj.subject);
        return _.map(_.filter(headers, (obj) => {
            _.includes(authSubjects, obj.subject);
        }), (sobj) => {
            return {
                subject: sobj.subject,
                pid: sobj.id
            }
        })
    } else {
        return [];
    }
}
