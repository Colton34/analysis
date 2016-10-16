import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';
import {COLORS_MAP as colorsMap} from '../lib/constants';
export default function HelperBox() {
    return (
        <div style={{ width: 1200,height:500, margin: '0 auto', marginTop: 20, backgroundColor: '#fff', zIndex: 0}} className='animated fadeIn'>
            <div style={{width:200,height:80,padding:30}}>
            <Link to={{pathname: '/helper/equivalent/score'}}>等值分数</Link>
            </div>
        </div>
    )
}
