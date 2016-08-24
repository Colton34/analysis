//历史表现比较。注意：这个还没有考虑好！！！

import React, { PropTypes } from 'react';
import commonClass from '../../../../common/common.css';
import ReactHighcharts from 'react-highcharts';
import DropdownList from '../../../../common/DropdownList';
import StandardScoreContrast from './StandardScoreContrast';
import RankRateContrast from './RankRateContrast';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

//因为是immutable？是因为异步？。。。确定是因为”异步“！！！-走了promise。那么是因为用的middleware(那里next和dispatch傻傻不清楚)还是只要是异步就不行？
import {testAction, testPromiseAction, testAsyncAction} from '../../../../reducers/examsCache/actions';

/**----------------------------mock data----------------------------------------------- */
var examList = [{value:'放假效果抽检'}, {value:'勇能考试'}, {value:'八十八所中学大联考'}]
/**----------------------------mock data end----------------------------------------------- */


class HistoryPerformance extends React.Component {
    constructor(props) {
        console.log('constructor');
      super(props);

    }

    componentWillMount() {
        console.log('componentWillMount');
    }

    componentDidMount() {
        console.log('componentDidMount');
        // this.props.testFun();
        // debugger;
        // this.props.testAsyncFun();
        // this.props.testPromiseFun();
    }

    componentWillReceiveProps(nextProps) {
        debugger;
        var params = {request: window.request};
        console.log('componentWillReceiveProps');
    }

    componentWillUpdate(nextProps, nextState) {
      console.log('componentWillUpdate');
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
    }

    testTheAsync() {
        this.props.testAsyncFun();
    }

    render() {
        return (
            <div>
                <h3 onClick={this.testTheAsync.bind(this)}>点击</h3>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryPerformance);

function mapStateToProps(state) {
    return {
        test: state.examsCache.test,
        testList: state.examsCache.testList
    }
}

function mapDispatchToProps(dispatch) {
    return {
        testFun: bindActionCreators(testAction, dispatch),
        testPromiseFun: bindActionCreators(testPromiseAction, dispatch),
        testAsyncFun: bindActionCreators(testAsyncAction, dispatch)
    }
}


// export default function HistoryPerformance() {

//     return (
//         <div id='historyPerformance' className={commonClass['section']} style={{position: 'relative'}}>
//             <div style={{marginBottom: 10}}>
//                 <span className={commonClass['title-bar']}></span>
//                 <span className={commonClass['title']}>历史表现比较</span>
//                 <span className={commonClass['title-desc']}>通过相同性质的考试比较，可以发现各学科标准分与排名率的变化</span>
//             </div>
//             <DropdownList list={examList} style={{position: 'absolute', top: 30, right: 30, zIndex: 1,borderRadius:2}}/>
//             <StandardScoreContrast/>
//             <RankRateContrast/>
//         </div>
//     )
// }
