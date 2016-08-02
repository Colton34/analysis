import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import {Link} from 'react-router';

class LoadingView extends React.Component {
    render() {
        return (
            <h1>hi, i'm try hard loading</h1>
        );
    }
}

export default LoadingView
