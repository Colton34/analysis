import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactHighcharts from 'react-highcharts';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from '../dashboard/dashboard.css';
import {makeSegments, makeSegmentsString, makeSegmentsDistribution} from '../../sdk';

export default function ZoubanScoreDetail({zoubanLessonStudentsInfo, zoubanExamInfo}) {
    var simpleLesson = zoubanExamInfo.lessons[0];
    var currentLessonStudentsInfo = zoubanLessonStudentsInfo[simpleLesson.objectId];
    var segments = makeSegments(simpleLesson.fullMark, 0, 10);
    var segmentsString = makeSegmentsString(segments);
    var simpleClass = simpleLesson.classes[0];
    var classSegmentDistribution = getClassSegmentDistribution(simpleClass, segments, currentLessonStudentsInfo);
    debugger;
    var config = {
         chart: {
            type: 'line'
        },
        colors:['#0099ff'],
        title: {
            text: '',
            x: -20 //center
        },
        xAxis: {
            categories: segmentsString
        },
        yAxis: {
            title: {
                text: '人数'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        // tooltip: {
        //     formatter: function(){
        //         return '分数区间：<b>' +
        //                 (this.point.first ? '[' : '(') +
        //                 this.point.low + ',' + this.point.high + ']</b><br/>' +
        //                 '人数:<b>' + this.point.y + '人</b>';
        //     }
        // },
        legend: {
            enabled: false
        },
        series: [{
            name: '人数',
            data: classSegmentDistribution.data
        }],
        credits: {
            enabled: false
        }
    }
    return (
        <div style={{ display: 'inline-block', height: 388, padding: '0 0 0 10px', cursor: 'pointer'}}  className='col-md-6'>
            <div className='dashboard-card' style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                <CardHeader />
                <ReactHighcharts config={config} style={{ width: 535, height: 240, marginTop: 30}}></ReactHighcharts>
            </div>
        </div>
    )
}

class CardHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverLink: false
        }
    }
     onHeaderMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    onHeaderMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        return (
            <Link to={{ pathname: '/rank/report', query: this.props.queryOptions}}
                onMouseEnter={this.onHeaderMouseEnter.bind(this) }
                onMouseLeave={this.onHeaderMouseLeave.bind(this) }
                style={_.assign({}, styles.linkHeader, this.state.hoverLink ? { color: '#27aef8', textDecoration: 'none' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>教学班成绩明细查看</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </Link>
        )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
}
const styles = {
    linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
};
function getClassSegmentDistribution(simpleClass, segments, currentLessonStudentsInfo) {
    var info = makeSegmentsDistribution(segments, currentLessonStudentsInfo[simpleClass]);
    info = _.map(info, (obj) => obj.count);
    return {
        name: simpleClass,
        data: info
    }
}
