import React from 'react';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from './dashboard.css';


class SchoolReportCard extends React.Component {
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
    toViewSchoolAnalysis() {
        var {grade, examid} = this.props;
        var targetUrl = grade ? '/school/report?examid=' + examid + '&grade=' + grade : '/school/report?examid=' + examid;
        browserHistory.push(targetUrl);
    }
    render() {
        var _this = this;
        var {examid, grade} = this.props;
        var queryOptions = (grade) ? {examid: examid, grade: grade} : {examid: examid};
        return (
            <div style={{ display: 'inline-block', height: 388, padding: '0 0 0 10px', cursor: 'pointer'}} onClick={this.toViewSchoolAnalysis.bind(this)} className='col-md-6'>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                    <div  onClick={this.toViewSchoolAnalysis.bind(this)}
                          onMouseEnter={this.onHeaderMouseEnter.bind(this)}
                          onMouseLeave={this.onHeaderMouseLeave.bind(this)}
                          style={_.assign({}, localStyles.linkHeader, _this.state.hoverLink ? {color: '#27aef8'} : {color: '#333'})}>
                        <span style={{fontSize: 16, marginRight: 10 }}>校级分析报告</span>
                        <span style={_.assign({},{ float: 'right'}, this.state.hoverLink? {color: '#27aef8'} : {color: '#bfbfbf'})}>
                            <i className='icon-right-open-2'></i>
                        </span>
                    </div>
                    <div className={dashboardStyle['school-report-img']} style={{marginTop: 30}}></div>
                </div>
            </div>
        )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' 
    }
}
export default SchoolReportCard;
