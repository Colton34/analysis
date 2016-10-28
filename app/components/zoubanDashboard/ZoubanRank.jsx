import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import _ from 'lodash';
import dashboardStyle from '../dashboard/dashboard.css';
import {Link, browserHistory} from 'react-router';
import {Table} from 'react-bootstrap';
import {NUMBER_MAP} from '../../lib/constants';
import TableView from '../../common/TableView';
import EnhanceTable from '../../common/EnhanceTable';

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


export default function ZoubanRank({zoubanLessonStudentsInfo, zoubanExamStudentsInfo, goNext}) {
    //取任意一个科目的前六名
    var dataMatrix = getDataMatrix(zoubanLessonStudentsInfo, zoubanExamStudentsInfo);//排名为什么没有见到第二名！！！
    return (
        <div style={_.assign({ display: 'inline-block', minHeight: 340, cursor: 'pointer',padding:'0px 10px 0px 0px'})} className={'col-md-6'} onClick={goNext}>
            <div className='dashboard-card' style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
               <CardHeader />
                <Table id='topRankTable' responsive style={{ width: '100%', height: '100%', margin: '20px 0 30px 0' }}>
                    <thead>
                        <tr>
                            <th style={_.assign({}, styles.tableCell, {paddingLeft: 30})}>名次</th>
                            <th style={styles.tableCell}>姓名</th>
                            <th style={styles.tableCell}>教学班</th>
                            <th style={styles.tableCell}>分数</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            dataMatrix.map((studentInfo, index) => {
                                return (
                                    <tr key={'studentRank-' + index} style={index % 2 === 0 ? {backgroundColor: '#f8f9fa'} : {backgroundColor: '#fff'}}>
                                        {
                                            _.range(4).map(num => {
                                                switch (num) {
                                                    case 0:
                                                        return <td key={'rank-' + num} style={_.assign({}, styles.tableCell, {paddingLeft: 30})}>第{studentInfo[0]}名</td>
                                                    case 1:
                                                        return <td key={'name-' + num} style={styles.tableCell}>{studentInfo[1]}</td>
                                                    case 2:
                                                        return <td key={'class-' + num} style={styles.tableCell}>{ studentInfo[2]}</td>
                                                    case 3:
                                                        return <td key={'socre-' + num} style={styles.tableCell}>{studentInfo[3]}</td>
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


function getDataMatrix(zoubanLessonStudentsInfo, zoubanExamStudentsInfo) {
    var zoubanExamStudentsInfoMap = _.keyBy(zoubanExamStudentsInfo, 'id');
    var lessonStudentsInfo = zoubanLessonStudentsInfo[_.keys(zoubanLessonStudentsInfo)[0]];
    var lessonAllStudentsInfo = _.unionBy(..._.values(lessonStudentsInfo), (obj) => obj.id);
    var targets = _.take(_.orderBy(lessonAllStudentsInfo, ['score'], ['desc']), 6);
    var body = _.map(targets, (obj) => {
        return [obj.lessonRank, zoubanExamStudentsInfoMap[obj.id].name, obj['class_name'], obj.score]
    });
    return body;
}
