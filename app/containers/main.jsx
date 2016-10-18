import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import _ from 'lodash';

import Select from '../common/Selector/Select';
// import Select from 'react-select';

const FLAVOURS = [
    { label: 'Chocolate', value: 'chocolate', key: 'a' },
    { label: 'Vanilla', value: 'vanilla', key: 'b' },
    { label: 'Strawberry', value: 'strawberry', key: 'c' },
    { label: 'Caramel', value: 'caramel', key: 'd' },
    { label: 'Cookies and Cream', value: 'cookiescream', key: 'e' },
    { label: 'Peppermint', value: 'peppermint', key: 'f' },
];

const WHY_WOULD_YOU = [
    { label: 'Chocolate (are you crazy?)', value: 'chocolate', disabled: true },
].concat(FLAVOURS.slice(1));

class TestSelect extends React.Component {
    constructor(props) {
        super(props);
        var value = FLAVOURS.slice(0, 2);
        this.state = {
            options: FLAVOURS,
            disabled: false,
            value: value
        }
    }

    handleSelectChange (value) {
        debugger;
        console.log('You\'ve selected:', value);
        var disabled = (value.length > 2);
        this.setState({ value, disabled });
    }

    render() {
        return (
            <div>
                <Select multi disabled={this.state.disabled} value={this.state.value} placeholder="Select your favourite(s)" options={this.state.options} onChange={this.handleSelectChange.bind(this)} />
            </div>
        );
    }
}

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

                <div><Link to={{pathname: '/zouban/question/quality', query: {examid: '101772-10202', grade: '高二'}}}>走班试题质量分析</Link></div>
                <div><Link to={{pathname: '/zouban/detail/class', query: {examid: '101772-10202', grade: '高二'}}}>班级成绩明细</Link></div>
                <div><Link to={{pathname: '/zouban/personal/report'}}>走班学生个人分析</Link></div>
                <div><Link to={{pathname: '/zouban/rank/score'}}>排行榜</Link></div>
                <TestSelect />

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
