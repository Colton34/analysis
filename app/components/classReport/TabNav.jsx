import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

class TabNav extends React.Component {
    render() {
        return (
            <div>
                <button onClick={this.props.changeClassReport.bind(null, 'multi')}>班级间报告</button>
                <button onClick={this.props.changeClassReport.bind(null, 'single')}>班级个体报告</button>
            </div>
        );
    }
}

export default TabNav;
