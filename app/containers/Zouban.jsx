import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';
import {COLORS_MAP as colorsMap} from '../lib/constants';
export default class Zouban extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div style={{ width: 1200, margin: '0 auto', marginTop: 20, backgroundColor: colorsMap.A02, zIndex: 0}} className='animated fadeIn'>
                <ReportNavHeader />
                {this.props.children}
            </div>
        );
    }
}

function ReportNavHeader() {
    return (
        <div>
            待填充(ReportNavHeader)
        </div>
    )
}
