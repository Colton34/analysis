import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

export default function HelperBox() {
    return (
        <div>
            <Link to={{pathname: '/helper/equivalent/score'}}>等值分数</Link>
        </div>
    )
}
