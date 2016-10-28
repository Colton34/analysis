import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from '../dashboard/dashboard.css';

const styles = {
    linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
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
            <div
                onMouseEnter={this.onHeaderMouseEnter.bind(this) }
                onMouseLeave={this.onHeaderMouseLeave.bind(this) }
                style={_.assign({}, styles.linkHeader, this.state.hoverLink ? { color: '#27aef8', textDecoration: 'none' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>知识点分析</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </div>
        )
    }
}

export default function KnowledgePointAnalysis() {

    return (
        <div style={{display: 'inline-block', height: 317, padding: '0 10px', cursor: 'pointer'}}  className='col-lg-4'>
            <div  style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                <CardHeader  />
                <div style={{display:'tableCell',textAlign:'center',paddingTop:'110px'}}>正在开发中敬请期待！</div>
            </div>
        </div>
    )
}


var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
}

