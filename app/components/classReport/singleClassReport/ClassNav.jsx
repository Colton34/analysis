import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

class ClassNav extends React.Component {
    render() {
        return (
            <div>
                <button onClick={this.props.chooseClass.bind(null, 'two')}>切换</button>
            </div>
        );
    }
}

export default ClassNav;
