import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

export default function NavHeader({examInfo}) {
    return (
        <div>
            <h4>header: 某场考试</h4>
        </div>
    )
}
