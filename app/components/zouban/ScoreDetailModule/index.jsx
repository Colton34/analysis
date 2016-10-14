import _ from 'lodash';
import React, { PropTypes } from 'react';
import commonClass from '../../../styles/common.css';
import QuestionCompare from './QuestionCompare';
import AverageCompare from './AverageCompare';
import StudentLevelsDistribution from './StudentLevelsDistribution';
export default class ScoreDetailModule extends React.Component {
    constructor(props) {
        super(props);
        
    }
    render() {
        return (
            <div>
                <QuestionCompare></QuestionCompare>
                <AverageCompare></AverageCompare>
                <StudentLevelsDistribution></StudentLevelsDistribution>
            </div>
        );
    }
}
