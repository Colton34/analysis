import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

class Main extends React.Component {
    render() {
        return (
            <div>
                <Link to={{pathname: '/subject/report', query: {examid: '23040', grade: '初二'}}}>【Mock】学科报告</Link>
                <Link to={{pathname: '/home'}}>【正常】首页</Link>
            </div>
        );
    }
}

export default Main;
