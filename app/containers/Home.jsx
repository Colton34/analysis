import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {initHomeAction} from '../reducers/home/actions';
import {initParams, convertJS} from '../lib/util';

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
        //对于pure render function 需要的数据因为有服务端渲染所以需要对数据格式做转换~所以转换的方法要放在render方法里，这样每次因为更新
        //Immutable数据结构的时候都会对其内部的子不变的非Immutable数据结构做转换
        var examList = convertJS(this.props.home.examList);
        console.log('data = ', examList[0]);
        return (
            <div>
                <h1>hi, Welcome Home~~~ {examList.length}</h1>
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

