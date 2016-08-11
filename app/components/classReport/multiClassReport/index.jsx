import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import SubjectMeanRank from './SubjectMeanRank';

class MultiClassReport extends React.Component {
    constructor(props) {
      super(props);

    }

    render() {
        return (
            <div>
                <div><h3>MultiClassReport</h3></div>
                <SubjectMeanRank reportDS={this.props.reportDS} />
            </div>
        );
    }
}

export default MultiClassReport;
