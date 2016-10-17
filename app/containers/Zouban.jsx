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
import {COLORS_MAP as colorsMap, ZOUBAN_TITLE_MAP as zoubanTitleMap} from '../lib/constants';

export default class Zouban extends React.Component {
    static need = [initZoubanDSAction]

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        var params = initParams({'request': window.request}, this.props.params, this.props.location);
        this.props.initZoubanDS(params);
    }

    render() {
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader examName={'期中考试'} examId={''} grade={'初一'} reportName={zoubanTitleMap[this.props.params.name]}/>
                {(this.props.ifError) ? (<CommonErrorView />) : ((this.props.isLoading || this.props.zoubanDS.size == 0) ? (<Spinkit />) : (this.props.children))}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zouban);

function mapStateToProps(state) {
    return {
        ifError: state.global.ifError,
        isLoading: state.global.isLoading,
        zoubanDS: state.zouban
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initZoubanDS: bindActionCreators(initZoubanDSAction, dispatch)
    }
}
