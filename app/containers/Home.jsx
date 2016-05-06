import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {initHomeAction} from '../reducers/home/actions';
import {initParams} from '../lib/util';

class Home extends React.Component {
    static need = [
        initHomeAction
    ];

    componentDidMount() {
        //因为服务端不会走这个方法，所以可以在这里安全的使用window变量
        var params = initParams(this.props.params, this.props.location, {'request': window.request});
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
        initHome: bindActionCreators(initHomeAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);

