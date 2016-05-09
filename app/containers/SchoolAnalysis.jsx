import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {initSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';
import {initParams, convertJS} from '../lib/util';

class SchoolTotalAnalysis extends React.Component {
    static need = [
        initSchoolAnalysisAction
    ];

    componentDidMount() {
        console.log('SchoolAnalysis componentDidMount');
        var params = initParams(this.props.params, this.props.location, {'request': window.request});
        this.props.initSchoolAnalysis(params);
    }

    render() {
        return (
            <div>
                <h1>Hi, Suprise~~~</h1>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        schoolAnalysis: state.schoolAnalysis
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initSchoolAnalysis: bindActionCreators(initSchoolAnalysisAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTotalAnalysis);
