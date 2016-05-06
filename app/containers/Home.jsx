import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
import {List} from 'immutable';

import {initHomeAction} from '../reducers/home/actions';
import {initParams, convertJS} from '../lib/util';

class Home extends React.Component {
    static need = [
        initHomeAction
    ];

    componentDidMount() {
        if(this.props.home.haveInit) return;
        //因为服务端不会走这个方法，所以可以在这里安全的使用window变量

console.log('客户端请求！');

        var params = initParams(this.props.params, this.props.location, {'request': window.request});
        this.props.initHome(params);
    }

    render() {
        //NOTE: 对于pure render function 需要的数据因为有服务端渲染所以需要对数据格式做转换~所以转换的方法要放在render方法里，这样每次因为更新
        //Immutable数据结构的时候都会对其内部的子不变的非Immutable数据结构做转换

        var examList = (List.isList(this.props.home.examList)) ? this.props.home.examList.toJS() : this.props.home.examList;
        console.log('examList.length = ', examList.length);

// console.log('examList ==================================== ', this.props.home.examList);

// debugger;

        // var examList = convertJS(this.props.home.examList);


        return (
            <div>
                <h1>hi, Welcome Home~~~</h1>

            </div>
        );
    }
}

/*

        //MOCK:下面是遍历
        var data = examList[0];
        var dataid = data.value[0].id;
        // console.log('data.id = ', data.value[0].id);
        var examid = (dataid) && (dataid.slice(dataid.lastIndexOf('0') + 1));
        var gradeKey = data.value[0].grade;
        console.log('gradeKey = ', gradeKey);


<Link to={{ pathname: '/dashboard', query: { examid: examid, grade: encodeURI(gradeKey) } }}>看板</Link>

{examList.length}

 */

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

