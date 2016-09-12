import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';
import {Link, browserHistory} from 'react-router';
import {Table} from 'react-bootstrap';
import {NUMBER_MAP} from '../../lib/constants';

/**
 * props:
 *  queryOptions: 跳转时的url query
 */
class CardHeader extends React.Component {
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
        return (
            <Link to={{ pathname: '/rank/report', query: this.props.queryOptions}}
                onMouseEnter={this.onHeaderMouseEnter.bind(this) }
                onMouseLeave={this.onHeaderMouseLeave.bind(this) }
                style={_.assign({}, styles.linkHeader, this.state.hoverLink ? { color: '#27aef8', textDecoration: 'none' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>分数排行榜</span>
                <span style={{ fontSize: 12 }}>最高分TOP6</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </Link>
        )
    }
}
/**
 * ({data, examid, grade})
 */
class ScoreRank extends React.Component {
    constructor(props) {
        super(props);
        this.scoreMap = {};
    }

    onClickScoreRank(queryOptions) {
        var targetUrl = '/rank/report?examid=' + queryOptions.examid + (queryOptions.grade ? '&grade=' + queryOptions.grade : '' );
        browserHistory.push(targetUrl);
    }
    sortScore() {
        var {data} = this.props;
        if (!data.top.length) {
            return;
        }
        var scoreMap = {};
        var scoreRank = [];
        _.forEach(data.top, (studentInfo, index) => {
            if (scoreMap[studentInfo.score] === undefined) {
                scoreMap[studentInfo.score] = {count: 1};
            } else {
                scoreMap[studentInfo.score].count += 1;
            }
        })
        scoreRank = _.orderBy(_.keys(scoreMap).map(strScore => {return parseFloat(strScore)}), [], 'desc');
        _.forEach(scoreRank, (score, index) => {
            scoreMap[score].rank = index === 0 ? 1 : scoreMap[scoreRank[index - 1]].count + scoreMap[scoreRank[index - 1]].rank;
        })
        this.scoreMap = scoreMap;
    }

    render() {
        var {data, examid, grade} = this.props;
        this.sortScore();

        var queryOptions = (grade) ? {examid: examid, grade: grade} : {examid: examid};
        return (
            <div style={_.assign({ display: 'inline-block', minHeight: 340, cursor: 'pointer'}, this.props.expand ? { padding: 0} : {padding: '0 10px 0 0'})} onClick={this.onClickScoreRank.bind(this, queryOptions)} className={this.props.expand? 'col-md-12' : 'col-md-6'}>
                <div className='dashboard-card' style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                   <CardHeader queryOptions={queryOptions}/>
                    <Table id='topRankTable' responsive style={{ width: '100%', height: '100%', margin: '20px 0 30px 0' }}>
                        <thead>
                            <tr>
                                <th style={_.assign({}, styles.tableCell, {paddingLeft: 30})}>名次</th>
                                <th style={styles.tableCell}>姓名</th>
                                <th style={styles.tableCell}>班级</th>
                                <th style={styles.tableCell}>分数</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.top.map((studentInfo, index) => {
                                    return (
                                        <tr key={'studentRank-' + index} style={index % 2 === 0 ? {backgroundColor: '#f8f9fa'} : {backgroundColor: '#fff'}}>
                                            {
                                                _.range(4).map(num => {
                                                    switch (num) {
                                                        case 0:
                                                            return <td key={'rank-' + num} style={_.assign({}, styles.tableCell, {paddingLeft: 30})}>第{NUMBER_MAP[this.scoreMap[studentInfo.score].rank]}名</td>
                                                        case 1:
                                                            return <td key={'name-' + num} style={styles.tableCell}>{studentInfo.name}</td>
                                                        case 2:
                                                            return <td key={'class-' + num} style={styles.tableCell}>{studentInfo.class}</td>
                                                        case 3:
                                                            return <td key={'socre-' + num} style={styles.tableCell}>{studentInfo.score}</td>
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
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    },
    tableCell: { border: 0, height: 40, fontWeight: 'normal', fontSize: 12, color: '#6a6a6a'}
};
