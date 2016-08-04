import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import ClassNav from './ClassNav';
import HeaderInfo from './HeaderInfo';
import ModuleNav from './ModuleNav';

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
                <h3>SingleClassReport</h3>
                <ClassNav chooseClass={this.chooseClass.bind(this)} />
                <HeaderInfo examInfo={this.props.reportDS.examInfo} />
                <ModuleNav />
            </div>
        );
    }
}

export default SingleClassReport;
