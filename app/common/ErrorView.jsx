import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';
// style
import commonClass from  '../styles/common.css';
import {COLORS_MAP as colorsMap} from '../lib/constants';

export default class ErrorView extends React.Component {
    render() {
        return (
            <div style={{width: 1200, height: 505, margin: '30px auto'}}>
                <div style={{width: 1200, height: 505, display: 'table-cell', textAlign: 'center', verticalAlign: 'middle', background: '#fff'}}>
                    <div className={commonClass['error-view']} style={{ margin: '0 auto', marginBottom: 30 }}></div>
                    <p style={{ color: colorsMap.C10, fontSize: 18, marginBottom: 0 }}>页面加载出错，请刷新或联系客服</p>
                    <p style={{ color: colorsMap.C09 }}></p>
                </div>
            </div>
        );
    }
}
