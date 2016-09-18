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
                <form action="">
                    <input type="text" placeholder="Hello" />
                </form>
                <Link to={{pathname: '/liankao/report', query: {examid: '1008720', grade: '初三'}}}>【Mock】联考报告</Link>
                <Link to={{pathname: '/home'}}>【正常】首页</Link>
            </div>
        );
    }
}

export default Main;
