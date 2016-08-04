import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

import CommonErrorView from '../common/ErrorView';
import CommonLoadingView from '../common/LoadingView';
import ReportNavHeader from '../common/report/NavHeader';
import TabNav from '../components/classReport/TabNav';

import {initReportDSAction} from '../reducers/reportDS/actions';

import {initParams} from '../lib/util';


/*
设计：
    1.一层一层往下拆分；遵从树状组织
    2.数据结构走schoolReprot--TODO:重构成report通用的
 */

/*
设计：1.将className设置成SingleClassReport的state

 */
class ContentComponent extends React.Component {
    // static need = [
    //     initReportDSAction
    // ]

    constructor(props) {
        super(props);
        this.state = {
            reportType: 'multi'
        };
    }

    componentDidMount() {
        if (this.props.haveInit) return;
        var params = initParams({ 'request': window.request }, this.props.params, this.props.location);
        this.props.initReportDS(params);
    }

    changeClass(type) {
        console.log('type == ', type);
        this.setState({
            reportType: type
        })
    }

    render() {
        var isSchoolManagerOrGradeManager = true;//TODO: 替换真实的判断
        return (
            <div>
                <ReportNavHeader />
                {(isSchoolManagerOrGradeManager) ? <TabNav changeClass={this.changeClass.bind(this)} /> : ''}
            </div>
        );
    }
}

const ContentView = connect(mapStateToProps, mapDispatchToProps)(ContentComponent);

class ClassReport extends React.Component {
    render() {
        return (
            <div>
                {(this.props.ifError) ? <CommonErrorView /> : (this.props.isLoading ? <CommonLoadingView /> : (
                    <ContentView params={this.props.params} location={this.props.location} />
                ))}
            </div>
        );
    }
}

export default ClassReport;

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
        initReportDS : bindActionCreators(initReportDSAction, dispatch)
    }
}

/*

                {(this.props.ifError) ? <CommonErrorView /> : (this.props.isLoading ? <CommonLoadingView /> : (
                    <ReportNavHeader />
                    (isSchoolManagerOrGradeManager) ? <TabNav changeClass={this.changeClass.bind(this)} /> : ''
                ))}

 */
