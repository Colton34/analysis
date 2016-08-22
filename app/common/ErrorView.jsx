import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

export default class ErrorView extends React.Component {
    render() {
        return (
            <h1>oh, man, there is something wrong~</h1>
        );
    }
}
