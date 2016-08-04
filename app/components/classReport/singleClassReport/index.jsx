import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

class SingleClassReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClass: 'one'
        }
    }

    chooseClass(className) {
        this.setState({
            currentClass: className
        })
    }

    render() {
        return (
            <div>
                <button onClick={this.chooseClass.bind(this, 'two')}>切换</button>
                <h3>SingleClassReport</h3>
                <h3>{this.state.currentClass}</h3>
            </div>
        );
    }
}

export default SingleClassReport;
