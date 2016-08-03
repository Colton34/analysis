// 　　Bgcolor:″＃6699CC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃66CCCC″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃B45B3E″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃479AC7″——配白色文字好看些，可以做标题
// 　　Bgcolor:″＃00B271″——配白色文字好看些，可以做标题

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Map} from 'immutable';
import _ from 'lodash';
//自定义组件
import Header from '../common/Header';
import Footer from '../common/Footer';
import Dialog from '../common/Dialog';
//引入样式
// import styles from 'css/main';
// const cx = classNames.bind(styles);

import {initUser, alterCommentDialogStatus} from '../reducers/global-app/actions';
import {convertJS} from '../lib/util';
import { BACKGROUND_COLOR } from '../lib/constants';
import commonStyle from '../common/common.css';

//let actionCreators = [alterCommentDialogStatus];


//模式：所有的router view都会有need来提前获取首屏数据。这时返回到前端的时候state中就是有数据的initial state
@Radium
class App extends React.Component {
    static need = [
        initUser
    ];
    getViewport() {
        if (document.compatMode == "BackCompat") {
            return {
                width: document.body.clientWidth,
                height: document.body.clientHeight
            }
        } else {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            }
        }
    }
    componentDidMount() {
        var viewPort = this.getViewport();
        $('#appComp').css({'min-height': viewPort.height})
    }
    render() {
        var user = (Map.isMap(this.props.user)) ? this.props.user.toJS() : this.props.user;

        var currentPath = this.props.location.pathname;
        return (
            <div id='appComp' style={_.assign({}, {backgroundColor: BACKGROUND_COLOR},(currentPath === '/' ? {}: {paddingBottom: 30}))} className={commonStyle['common-font']}>
                <Header user={user} actions={this.props.actions}/>
                <Dialog />
                    {this.props.children}
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        user: state.global.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(alterCommentDialogStatus, dispatch)
    }

}
export default connect(mapStateToProps, mapDispatchToProps)(App);
// export default connect(mapStateToProps)(Radium(App)); -- 或者这么写

