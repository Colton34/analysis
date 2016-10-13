import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

export default class Zouban extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
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
