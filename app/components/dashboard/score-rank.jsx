import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';
import {Link} from 'react-router';
import {Table} from 'react-bootstrap';
import {NUMBER_MAP} from '../../lib/constants';
/*

    return {
        top: _.reverse(_.takeRight(examScoreArr, 6)),
        low: _.reverse(_.take(examScoreArr, 6))
    }

 */
/*
const ScoreRank = ({data, examid, grade}) => {
    var flagFirstColor =  {color: '#FF0033'};
    var flagSecondColor = {color: '#54ba54'};
    var flagThirdColor =  {color: '#ce9dff'};
    var tops = _.map(data.top, function(obj, index) {
        var flagColor = {};
        if(index === 0) {flagColor.first = true};
        if(index === 1) {flagColor.second = true};
        if(index === 2) {flagColor.third = true};

        var result = ((flagColor.first && flagFirstColor) || (flagColor.second && flagSecondColor) || (flagColor.third && flagThirdColor));

        return (
            <div key={index} style={[styles.container, result, styles.common.radius, {marginBottom: 8}]}>
                <div>{obj.name}</div>
                <div>{obj.class}班</div>
                <div>{obj.score}分</div>
            </div>
        )
    });

    var lows = _.map(data.low, function(obj, index) {
        return (
            <div key={index} style={[styles.container, styles.common.radius, {marginBottom: 2}]}>
                <div>{obj.name}</div>
                <div>{obj.score}分</div>
            </div>
        )
    });

// if(grade) {
//     console.log('-================  不可能');
//     debugger;
// }



    var queryOptions = (grade) ? {examid: examid, grade: grade} : {examid: examid};

    return (
        <div className={dashboardStyle.card}>
            <div className={dashboardStyle['card-title']}>分数排行榜</div>
            <div style={{flexGrow: 1, display: 'flex', marginTop: 20}}>
                <div style={[styles.box,{marginLeft: 5}]}>
                    <p style={{textAlign: 'center', marginBottom: 20}}>最高分排行榜top6</p>
                    {tops}
                </div>
            </div>
            <Link to={{ pathname: '/rank/report', query: queryOptions }} className={dashboardStyle['detail-btn']}>
                查看详情
            </Link>
        </div>
    )

}
*/

/**
 * ({data, examid, grade})
 */
class ScoreRank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverLink: false
        }
    }
    onHeaderMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    onHeaderMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        var {data, examid, grade} = this.props;
        var queryOptions = (grade) ? {examid: examid, grade: grade} : {examid: examid};
        return (
            <div style={{ display: 'inline-block', height: 340, padding: '0 10px 0 0'}}  className='col-lg-6'>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                    <Link to={{ pathname: '/rank/report', query: queryOptions }} 
                          onMouseEnter={this.onHeaderMouseEnter.bind(this)}
                          onMouseLeave={this.onHeaderMouseLeave.bind(this)} 
                          style={_.assign({}, styles.linkHeader, this.state.hoverLink ? {color: '#27aef8', textDecoration: 'none'} : {color: '#333'})}>
                        <span style={{ fontSize: 16, marginRight: 10 }}>分数排行榜</span>
                        <span style={{ fontSize: 12 }}>最高分TOP5</span>
                        <span style={_.assign({},{ float: 'right'}, this.state.hoverLink? {color: '#27aef8'} : {color: '#bfbfbf'})}>{'>'}</span>
                    </Link>
                    
                    <Table id='topRankTable' striped responsive hover style={{ width: '100%', height: '100%', marginTop: 20 }}>
                        <thead>
                            <tr>
                                <th style={{ border: 0 }}>名次</th>
                                <th style={{ border: 0 }}>姓名</th>
                                <th style={{ border: 0 }}>班级</th>
                                <th style={{ border: 0 }}>分数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.top.map((studentInfo, index) => {
                                    return (
                                        <tr key={'studentRank-' + index}>
                                            {
                                                _.range(4).map(num => {
                                                    switch (num) {
                                                        case 0:
                                                            return <td key={'rank-' + num} style={{ border: 0 }}>第{NUMBER_MAP[index+1]}名</td>
                                                        case 1:
                                                            return <td key={'name-' + num} style={{ border: 0 }}>{studentInfo.name}</td>
                                                        case 2:
                                                            return <td key={'class-' + num} style={{ border: 0 }}>{studentInfo.class}</td>
                                                        case 3:
                                                            return <td key={'socre-' + num} style={{ border: 0 }}>{studentInfo.score}</td>
                                                    }
                                                })
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }

}

export default Radium(ScoreRank);


const styles = {
    common: {
        radius: {
            borderRadius: 15
        }
    },
    item: {height: 320, backgroundColor: '#336699', flexGrow: 1, textAlign: 'center', color: '#ffffff', borderRadius: 15, display: 'flex', flexDirection: 'column'},
    box: {
        flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around'
    },
    container: {
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-around'
    },
    linkHeader: {
        display: 'block', height: 50, lineHeight: '50px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' 
    }
};
