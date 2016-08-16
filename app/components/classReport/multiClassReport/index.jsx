import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import Header from './Header';
import SubjectMeanRank from './SubjectMeanRank';
import ClassScoreGuide from './ClassScoreGuide';
import CustomScoreSegment from './CustomScoreSegment';
import SubjectSmallScore from './SubjectSmallScore';
import CustomScoreLevel from './CustomScoreLevel';

class MultiClassReport extends React.Component {
    constructor(props) {
      super(props);

    }

    render() {
        return (
            <div>
                <Header examInfo={this.props.reportDS.examInfo} />
                <SubjectMeanRank reportDS={this.props.reportDS} />
                <ClassScoreGuide reportDS={this.props.reportDS} />
                {/*<CustomScoreSegment reportDS={this.props.reportDS} />*/}
                {/*<SubjectSmallScore reportDS={this.props.reportDS} />*/}
                {/*<CustomScoreLevel reportDS={this.props.reportDS} />*/}
            </div>
        );
    }
}

export default MultiClassReport;
