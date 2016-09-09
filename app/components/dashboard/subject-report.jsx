import React from 'react';
import dashboardStyle from './dashboard.css';
import {browserHistory} from 'react-router';

class SubjectReport extends React.Component {
    constructor(props){
        super(props);

    }

    viewClassReport() {
        var {examid, grade} = this.props;
        var targetUrl = grade ? '/subject/report?examid=' + examid + '&grade=' + grade : '/subject/report?examid=' + examid;
        browserHistory.push(targetUrl);
    }

    render() {
        return (
            <div onClick={this.viewClassReport.bind(this)} style={{display: 'inline-block', height: 340, padding: '0 0 0 10px', cursor:'pointer' }}  className='col-lg-4'>
                {/*<div style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                        <div id='scoreRankHeader' onMouseEnter={this.onHeaderMouseEnter} onMouseLeave={this.onHeaderMouseLeave} style={{ height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}>
                            <span style={{ color: '#333', fontSize: 16, marginRight: 10 }}>学科分析报告</span>
                            <span style={{ float: 'right', color: '#bfbfbf' }}><i className='icon-right-open-2'></i></span>
                        </div>
                        <div className={styles['subject-report']}></div>
                </div>*/}
                 <div className={dashboardStyle['subject-report-img']}></div>
            </div>

        )

    }
}

export default SubjectReport;
