import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {clientInitSchoolAnalysisAction, serverInitSchoolAnalysisAction} from '../reducers/schoolAnalysis/actions';

class SchoolTotalAnalysis extends React.Component {
    static need = [
        serverInitSchoolAnalysis
    ];

    componentDidMount() {
        console.log('SchoolAnalysis componentDidMount');

        // var {examid} = this.props.params;
        var params = this.props.params || {};
        var query = this.props.location.query || {};
        params = _.merge(params, query); //因此params中的key不能喝query中的key有重复！
        // var {query} = this.props.location;
        // var examid = query && query.examid ? query.examid : '';
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
        initSchoolAnalysis: bindActionCreators(clientInitSchoolAnalysis, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTotalAnalysis);
