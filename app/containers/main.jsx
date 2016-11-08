import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import _ from 'lodash';

import Select from '../common/Selector/Select';

var groups = [
        {label:'Group One',children:[{value:'1-One', selected: true},{value:'1-Two', selected: true},{value:'1-Three', selected: true},{value:'1-Four',label:'Four Label'}]},
        {label:'Group Two',children:[{value:'2-One', selected: true},{value:'2-Two'},{value:'2-Three'},{value:'2-Four',label:'Four Label'}]},
        {label:'Group Three',children:[{value:'3-One', selected: true},{value:'3-Two'},{value:'3-Three'},{value:'3-Four',label:'Four Label'}]}
    ];
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





class TestImageDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDisplay: false
        }
    }

    showModal() {
        this.setState({
            isDisplay: true
        })
    }

    hideModal() {
        this.setState({
            isDisplay: false
        })
    }

    render() {
        return (
            <div>
                <h4>我是图片</h4>
                <Modal show={ this.state.isDisplay } ref="dialog"  onHide={this.hideModal.bind(this)}>
                    <Header closeButton={false} style={{position: 'relative', textAlign: 'center', height: 60, lineHeight: 2, color: '#333', fontSize: 16, borderBottom: '1px solid #eee'}}>
                        <button className={commonClass['dialog-close']} onClick={this.hideModal.bind(this)}>
                            <i className='icon-cancel-3'></i>
                        </button>
                        设置分档线
                    </Header>
                    <LevelForm reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} hideModal={this.hideModal.bind(this)}
                        changeLevels={this.props.changeLevels.bind(this)} saveBaseline={this.props.saveBaseline.bind(this)} />
                </Modal>
            </div>
        );
    }
}
















class TestSelect2 extends React.Component {
    constructor(props) {
        super(props);

    }

    handleChange(v, e) {
        debugger;
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

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

                <div><Link to={{pathname: '/zouban/dashboard', query: {examid: '101772-10202', grade: '高二'}}}>走班Dashboard</Link></div>
                <div><Link to={{pathname: '/zouban/question/quality', query: {examid: '101772-10202', grade: '高二'}}}>走班试题质量分析</Link></div>
                <div><Link to={{pathname: '/zouban/detail/class', query: {examid: '101772-10202', grade: '高二'}}}>班级成绩明细</Link></div>
                <div><Link to={{pathname: '/zouban/personal/report'}}>走班学生个人分析</Link></div>
                <div><Link to={{pathname: '/zouban/rank/score'}}>排行榜</Link></div>

                <div><Link to={{pathname: '/zouban/personal', query: {examid: '101772-10202', grade: '高二'}}}>学生个人</Link></div>
                <TestSelect />

                <h5>=========== 走班分割线========================</h5>

                <form action="">
                    <input type="text" placeholder="Hello" />
                </form>
                <button onClick={this.delCustomExam.bind(this)}>删除自定义</button>
                <Link to={{pathname: '/liankao/report', query: {examid: '1029261-749', grade: '初二'}}}>【Mock】联考报告</Link>
                <Link to={{pathname: '/home'}}>【正常】首页</Link>
            </div>
        );
    }
}

export default Main;
