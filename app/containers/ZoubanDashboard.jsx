import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Spinkit from '../common/Spinkit';
import CommonErrorView from '../common/ErrorView';
import ReportNavHeader from '../common/report/NavHeader';

import {initParams} from '../lib/util';
import {initZoubanDSAction} from '../reducers/zouban/actions';

import ZoubanNavHeader from '../components/zoubanDashboard/ZoubanNavHeader';
import ZoubanExamGuide from '../components/zoubanDashboard/ZoubanExamGuide';
import ZoubanRank from '../components/zoubanDashboard/ZoubanRank';
import ZoubanScoreDetail from '../components/zoubanDashboard/ZoubanScoreDetail';
import ZoubanQuestionQuanlity from '../components/zoubanDashboard/ZoubanQuestionQuanlity';
import ZoubanStudentInfo from '../components/zoubanDashboard/ZoubanStudentInfo';

import {COLORS_MAP as colorsMap} from '../lib/constants';

class ZoubanDashboard extends React.Component {
    static need = [initZoubanDSAction]

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if(this.props.zouban.haveInit) return;
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.initZoubanDS(params);
    }

    render() {
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                {(this.props.ifError) ? (<CommonErrorView />) : ((this.props.isLoading || !this.props.zouban.haveInit) ? (<Spinkit />) : (<ZoubanDashboardContent zouban={this.props.zouban} />))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoubanDashboard);
function mapStateToProps(state) {
    return {
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,
        zouban: state.zouban
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initZoubanDS: bindActionCreators(initZoubanDSAction, dispatch)
    }
}


class ZoubanDashboardContent extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        var zoubanExamInfo = this.props.zouban.zoubanExamInfo.toJS(), zoubanExamStudentsInfo = this.props.zouban.zoubanExamStudentsInfo.toJS(), zoubanLessonStudentsInfo = this.props.zouban.zoubanLessonStudentsInfo.toJS(), zuobanLessonQuestionInfo = this.props.zouban.zuobanLessonQuestionInfo.toJS();

        return (
            <div>
                <ZoubanNavHeader zoubanExamInfo={zoubanExamInfo} />
                <ZoubanExamGuide zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} />
                <ZoubanRank zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} />
                <ZoubanScoreDetail zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} />
                <ZoubanQuestionQuanlity zoubanExamInfo={zoubanExamInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} />
                <ZoubanStudentInfo zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamInfo={zoubanExamInfo} />
            </div>
        );
    }
}


/*


                <ZoubanNavHeader zoubanExamInfo={zoubanExamInfo} />
                <ZoubanExamGuide zoubanExamInfo={zoubanExamInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} />
                <ZoubanRank zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamStudentsInfo={zoubanExamStudentsInfo} />
                <ZoubanScoreDetail zoubanExamInfo={zoubanExamInfo} zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} />
                <ZoubanQuestionQuanlity zoubanExamInfo={zoubanExamInfo} zuobanLessonQuestionInfo={zuobanLessonQuestionInfo} />
                <ZoubanStudentInfo zoubanLessonStudentsInfo={zoubanLessonStudentsInfo} zoubanExamInfo={zoubanExamInfo} />


 */
