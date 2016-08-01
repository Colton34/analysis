import React from 'react';
import Radium from 'radium';
import {Link} from 'react-router';
import { bindActionCreators } from 'redux';
import {Map, List} from 'immutable';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
const ReactHighcharts = require('react-highcharts');

import {initParams} from '../lib/util';
import {changeOne, changeTwo} from '../reducers/test/actions';

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

class One extends React.Component {
    render() {
        console.log('one render');
        var one = (Map.isMap(this.props.one)) ? this.props.one.toJS() : this.props.one;
        // var one = this.props.one;
        return (
            <h1>Hi, {one.a.age}</h1>
        );
    }
}

class Two extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
      console.log('two if equal: ', nextProps.two.equals(this.props.two));
      return (!nextProps.two.equals(this.props.two));
    }

    render() {
        console.log('two render');
        var two= (List.isList(this.props.two)) ? this.props.two.toJS() : this.props.two;
        // var two = this.props.two;
        return (
            <h1>oh, {two.length}</h1>
        );
    }
}

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
        return (
            <div>
                <div><button onClick={this.props.changeOne}>Click One</button></div>
                <div><button onClick={this.props.changeTwo}>Click Two</button></div>
                <One one={this.props.one} />
                <Two two={this.props.two} />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Test);

function mapStateToProps(state) {
    return {
        one: state.test.one,
        two: state.test.two
    }
}

function mapDispatchToProps(dispatch) {
    return {
        changeOne: bindActionCreators(changeOne, dispatch),
        changeTwo: bindActionCreators(changeTwo, dispatch)
    }
}

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

/*

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

 */
