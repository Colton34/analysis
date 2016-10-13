import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import {HELPER_TITLE_MAP as helperTitleMap} from '../lib/constants';

function HelperBoxNav({title}) {
    return (
        <div>
            <Link to={{pathname: '/dashboard'}}>返回</Link>
            <span>{title}</span>
        </div>
    )
}

export default class HelperBoxContainer extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <HelperBoxNav title={helperTitleMap[this.props.params.name]} />
                {this.props.children}
            </div>
        );
    }
}
