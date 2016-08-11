import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import SubjectMeanRank from './SubjectMeanRank';
import CustomScoreSegment from './CustomScoreSegment';
import SubjectSmallScore from './SubjectSmallScore';

class MultiClassReport extends React.Component {
    constructor(props) {
      super(props);

    }

    render() {
        return (
            <div>
                <div><h3>MultiClassReport</h3></div>
                {/*<SubjectMeanRank reportDS={this.props.reportDS} />*/}
                {/*<CustomScoreSegment reportDS={this.props.reportDS} />*/}
                <SubjectSmallScore reportDS={this.props.reportDS} />
            </div>
        );
    }
}

export default MultiClassReport;
