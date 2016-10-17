import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

class Main extends React.Component {
    delCustomExam() {
        var url = '/exam/custom/analysis';
        debugger;
        window.request.put(url, {examId: '5002976'}).then(function(res) {
            console.log(res.data);
            debugger;
        }).catch(function(err) {
            console.log('Error: ', err);
        })
    }

    render() {
        return (
            <div>
                <h4>走班Mock</h4>
                <div><Link to={{pathname: '/helper'}}>小助手</Link></div>
                <div><Link to={{pathname: '/zouban/question/report'}}>走班试题质量分析</Link></div>
                <div><Link to={{pathname: '/zouban/detail/report'}}>班级成绩明细</Link></div>
                <div><Link to={{pathname: '/zouban/personal/report'}}>走班学生个人分析</Link></div>

                <h5>=========== 走班分割线========================</h5>

                <form action="">
                    <input type="text" placeholder="Hello" />
                </form>
                <button onClick={this.delCustomExam.bind(this)}>删除自定义</button>
                <Link to={{pathname: '/liankao/report', query: {examid: '1009016-1647', grade: '初一'}}}>【Mock】联考报告</Link>
                <Link to={{pathname: '/home'}}>【正常】首页</Link>
            </div>
        );
    }
}

export default Main;
