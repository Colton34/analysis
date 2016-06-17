import React from 'react';
import {Link} from 'react-router';

import { Button } from 'react-bootstrap';

import Radium from 'radium';

const ReactHighcharts = require('react-highcharts');

import {initParams} from '../lib/util';

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

    downloadFile() {
        var params = initParams(this.props.params, this.props.location, { 'request': window.request });
        params.request.get('/file/download?url='+this.props.location.pathname+this.props.location.search).then(function(res) {
            console.log('===================  res.data = ', res.data);
            saveAs("http://localhost:3000/api/v1/file/get?filename="+res.data, '报告.png');
            //延时10秒后删除文件
        }).catch(function(err) {
            console.log('err = ', err);
        })
    }

    render() {
        var exam = {id: 167}
        var path = '/school/report'; //'' + 167 +
        return (
            <div>
                <Link to="/home">主页</Link>
                <br />
                <br />
                <Button onClick={this.downloadFile.bind(this)} bsStyle="primary">Primary</Button>
                <br />
                <br />
                <Link to="/dashboard">看板</Link>
                <br />
                <br />
                <Link to={{ pathname: path, query: { examid: exam.id } }}>校级报告</Link>
                <br />
                <br />
                <Link to={{ pathname: '/rank/report', query: { examid: '167', grade: encodeURI('高三') } }}>
                    排行榜
                </Link>
                <ReactHighcharts config={config}></ReactHighcharts>
            </div>
        );
    }
}

export default Test;


function saveAs(uri, filename) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = uri;
    link.click();
    document.body.removeChild(link); //remove the link when done
  } else {
    location.replace(uri);
  }
}
