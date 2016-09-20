import _ from 'lodash';
import React, { PropTypes } from 'react';

import HeaderModule from './headerModule';
import TableContentModule from './TableContentModule';
import SummaryInfoModule from './summaryInfoModule';

/*
Note:

 */
export default class TotalScoreDisModule extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        console.log('父亲comdid');
    }

    render() {
        return (
            <div>
                <HeaderModule reportDS={this.props.reportDS} examId={this.props.examId} grade={this.props.grade} />
                <TableContentModule reportDS={this.props.reportDS} />
                <SummaryInfoModule reportDS={this.props.reportDS}/>
            </div>
        );
    }
}
