import React from 'react';
import {Link} from 'react-router';

import Radium from 'radium';

const ReactHighcharts = require('react-highcharts');

const config = {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Fruit Consumption'
        },
        xAxis: {
            categories: ['Apples', 'Bananas', 'Oranges']
        },
        yAxis: {
            title: {
                text: 'Fruit eaten'
            }
        },
        series: [{
            name: 'Jane',
            data: [1, 0, 4]
        }, {
            name: 'John',
            data: [5, 7, 3]
        }]
    };

class Test extends React.Component {
    constructor(props) {
      super(props);

    }

    render() {
        var exam = {id: 167}
        var path = '/school/analysis'; //'' + 167 +
        return (
            <div>
                <Link to="/dashboard">看板</Link>
                <br />
                <br />
                <Link to={{ pathname: path, query: { examid: exam.id } }}>校级报告</Link>
                <ReactHighcharts config={config}></ReactHighcharts>
            </div>
        );
    }
}

export default Test;


