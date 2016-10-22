import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link} from 'react-router';

export default function ZoubanNavHeader({zoubanExamInfo}) {
    var examName = zoubanExamInfo.name;
    debugger;
    return (
        <div style={{ height: 40, lineHeight: '40px', backgroundColor: '#EFF1F4', margin: '10px auto 10px -15px', fontSize: 16, color: '#333' }}>
            <Link to={{ pathname: '/' }} style={styles.dashboardTitleName}><i className='icon-fanhui2' style={{ color: '#59bde5' }}></i></Link>
            <span style={{ fontSize: 14, color: '#333', marginLeft: 20 }}><a style={{ color: '#b4b4b4' }} href='/'>{'首页'}<i className='icon-right-open-2'></i></a> {examName}</span>
        </div>
    )
}
var styles = {
    dashboardTitleName: {
        textDecoration: 'none',display: 'inline-block', width: 10, height: 10,
        ':hover': {textDecoration: 'none', color: '#333'}
    }
}
