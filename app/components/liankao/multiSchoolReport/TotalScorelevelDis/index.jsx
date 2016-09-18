import _ from 'lodash';
import React, { PropTypes } from 'react';

import HeaderModule from './headerModule';
import TableContentModule from './TableContentModule';
import SummaryInfoModule from './summaryInfoModule';

/*
Note: 1.保留记录分档参数。但是当查看此学校的校级报告的时候还是要有一个baseline，和这个不一样。

 */
class TotalScoreDisModule extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <HeaderModule />
                <TableContentModule />
                <SummaryInfoModule />
            </div>
        );
    }
}
