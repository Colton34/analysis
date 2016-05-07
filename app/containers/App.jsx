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

//自定义组件
import Header from '../common/Header/Header';
import Footer from '../common/Footer';

//引入样式
// import styles from 'css/main';
// const cx = classNames.bind(styles);

import {initUser} from '../reducers/global-app/actions';
import {convertJS} from '../lib/util';



//模式：所有的router view都会有need来提前获取首屏数据。这时返回到前端的时候state中就是有数据的initial state
@Radium
class App extends React.Component {
    static need = [
        initUser
    ];

    render() {
        var user = (Map.isMap(this.props.user)) ? this.props.user.toJS() : this.props.user;
        return (
            <div>
                <Header user={user} />
                    {this.props.children}
                <Footer />
            </div>
        );
    }

}


function mapStateToProps(state) {
    return {
        user: state.app.user
    }
}

export default connect(mapStateToProps)(App);
// export default connect(mapStateToProps)(Radium(App)); -- 或者这么写

