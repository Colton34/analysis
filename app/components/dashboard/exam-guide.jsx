import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';

import {initExamGuide} from '../../reducers/dashboard/actions';

//从设计上考虑，Component都应该尽量是pure statless component
@Radium
class GlobalGuideCom extends React.Component {
    // static propTypes = {
    //     subjectCount: PropTypes.number.isRequired,
    //     totoalProblemCount: PropTypes.number.isRequired,
    //     classCount: PropTypes.number.isRequired,
    //     totoalProblemCount: PropTypes.number.isRequired
    // };

    constructor(props) {
        super(props);
    }

    //支持客户端路由异步获取数据
    componentDidMount() {
        // INIT_GLOBAL_GUIDE  -- 客户端路由过来怎么获取数据，此生命周期方法是否是在server render是没有的
        console.log('componentDidMount');
        // initExamGuide();
    }

    render() {
        return (
                <div style={[styles.item, styles.common.radius]}>
                    <div style={{fontWeight: 'blod', marginTop: 10}}>考试总览</div>
                    <div  style={{marginTop: 30, marginBottom: 30}}>
                        <div style={{float: 'left', marginLeft: 40}}>
                            <div style={{marginBottom: 20}}>{this.props.data.subjectCount}</div>
                            <div>考试学科数</div>
                        </div>
                        <div style={{float: 'right', marginRight: 40}}>
                            <div style={{marginBottom: 20}}>{this.props.data.totoalProblemCount}</div>
                            <div>考试总题数</div>
                        </div>
                    </div>
                    <div style={{clear: 'both'}}></div>
                    <div  style={{marginTop:30, marginBottom: 30}}>
                        <div style={{float: 'left', marginLeft: 40}}>
                            <div style={{marginBottom: 20}}>{this.props.data.classCount}</div>
                            <div>考试班级数</div>
                        </div>
                        <div style={{float: 'right', marginRight: 40}}>
                            <div style={{marginBottom: 20}}>{this.props.data.totoalStudentCount}</div>
                            <div>考试学生数</div>
                        </div>
                    </div>
                </div>
        );
    }
}

var styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 260, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15}
}

//display: 'flex', alignItems: 'center'

export default GlobalGuideCom;
