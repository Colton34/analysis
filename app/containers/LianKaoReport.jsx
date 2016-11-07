/*
设计：
1、通过添加中间层平滑重构
2、联考校内权限；特定的通用数据结构：联考所有学校全部数据；当前学校数据
    权限：教育局人员（特殊联考学校的校管理员）可以看到联考间总体报告和单个学校导航条，从而查看各个单个学校的报告
         参与联考的普通学校管理员：只能看到当前学校的联考校内分析报告--且没有导航条，且没有联考总体

联考数据结构：
1、newReportDS（通过旧的reportDS转换）
2、获取当前学校的数据


问题：
1.http://fx-engine.yunxiao.com/school?id=25  赣州的联考考试的from值不是20
2.http://fx-engine.yunxiao.com/exam?id=7310-818 这个联考考试下的paper的grade是空
3.规律：有一个联考虚拟学校，此学校的管理员是教育局角色；每一场考试都对应有<examid>-<liankao_schoolid>和<examid>-<schoolid>前者是全部，后者是一个学校的数据

4.怎么从一个普通学校的管理员登录，点击一场自己学校参与的联考的考试examid是<exam1-schoolA>，怎么得到对应的联考的这个考试：exam1这个id不变，但是要获取对应的虚拟学校的id
 */



import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {Map} from 'immutable';

import CommonErrorView from '../common/ErrorView';
import Spinkit from '../common/Spinkit';
import ReportNavHeader from '../common/report/NavHeader';
import ReportTabNav from '../components/liankao/ReportTabNav';
import MultiSchoolReport from '../components/liankao/multiSchoolReport';
import SingleSchoolLianKaoReport from '../components/liankao/singleSchoolReport';
import {initReportDSAction} from '../reducers/reportDS/actions';

import {initParams} from '../lib/util';

import {COLORS_MAP as colorsMap} from '../lib/constants';

class ContentComponent extends React.Component {
    constructor(props) {
        super(props);
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
        var examName = this.props.reportDS.examInfo.toJS().name;
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader examName={examName} examId={this.props.examid} grade={this.props.grade} reportName={'联考总体分析报告'}/>
                {/* {(this.ifCanReviewMultiReport) ? <ReportTabNav changeSchoolReport={this.changeClassReport.bind(this)} schoolList={authSchoolsList} reportDS={this.props.reportDS} /> : ''}  //【暂时】没有单个学校联考报告 */}
                <MultiSchoolReport user={this.props.user} reportDS={this.props.reportDS} examId={this.props.examid} grade={this.props.grade} />
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
                    <ContentComponent examid={examid} grade={grade} reportDS={this.props.reportDS} user={this.props.user.toJS()} />
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
