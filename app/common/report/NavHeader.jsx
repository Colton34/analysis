import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

//constants
import {COLORS_MAP as colorsMap} from '../../lib/constants';

var localStyle = {
    titleName: {
        textDecoration: 'none', display: 'inline-block', width: 10, height: 10,
        ':hover': { textDecoration: 'none', color: '#333' }
    }
};

export default function NavHeader({examName, examId, grade, reportName, isZouban}) {
    var queries = (isZouban) ? {examid: examId} : {examid: examId, grade: grade};
    var pathname = (isZouban) ? '/zouban/dashboard' : '/dashboard';
    debugger;//需要测试在普通报告中点击回退到dashboard的地址栏里参数是否正确
    console.log('queries = ', JSON.stringify(queries));
    console.log('pathname = ', pathname);
    console.log('isZouban = ', isZouban);
    return (
        <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}}>
            <div style={{ height: 40, lineHeight: '40px', backgroundColor: '#EFF1F4', margin: '10px auto 10px 0', fontSize: 16, color: colorsMap.C12 }}>
                <span style={localStyle.titleName}><i className='icon-fanhui2' style={{ color: '#59bde5' }}></i></span>
                <span style={{ fontSize: 14, color: '#333', marginLeft: 20 }}>
                    <Link to={{ pathname: pathname,  query: queries}} style={{color: '#b4b4b4'}}>{examName}</Link>
                    <span><i className='icon-right-open-2'></i>{reportName}</span>
              </span>
            </div>
        </div>
    )
}
