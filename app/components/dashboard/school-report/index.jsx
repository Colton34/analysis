import React from 'react';
import {Link, browserHistory} from 'react-router';
import styles from './schoolReport.css';


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
            <div style={{ display: 'inline-block', height: 340, padding: '0 0 0 10px'}}  className='col-lg-6'>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 5, padding: '0 30px' }}>
                    <div  onClick={this.toViewSchoolAnalysis.bind(this)}
                          onMouseEnter={this.onHeaderMouseEnter.bind(this)}
                          onMouseLeave={this.onHeaderMouseLeave.bind(this)}
                          style={_.assign({}, localStyles.linkHeader, _this.state.hoverLink ? {color: '#27aef8'} : {color: '#333'})}>
                        <span style={{fontSize: 16, marginRight: 10 }}>校级分析报告</span>
                        <span style={_.assign({},{ float: 'right'}, this.state.hoverLink? {color: '#27aef8'} : {color: '#bfbfbf'})}>{'>'}</span>
                    </div>
                    <div className={styles['school-report']} style={{marginTop: 30}}></div>
                </div>
            </div>
        )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 50, lineHeight: '50px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' 
    }
}
export default SchoolReportCard;
