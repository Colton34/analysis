import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {clientInitHomeAction, serverInitHomeAction} from '../reducers/home/actions';

class Home extends React.Component {
    static need = [
        serverInitHomeAction
    ];

    componentDidMount() {
        var params = this.props.params || {};
        var query = this.props.location.query || {};
        params = _.merge(params, query);
        this.props.initHome(params);
    }

    render() {
        return (
            <div>
                <h1>hi, Welcome Home~~~</h1>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        home: state.home
    }
}

function mapDispatchToProps(dispatch) {
    return {
        initHome: bindActionCreators(clientInitHomeAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

