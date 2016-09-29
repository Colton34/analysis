
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Radium from 'radium';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';
import dashboardStyle from './dashboard.css';
import {NUMBER_MAP as numberMap} from '../../lib/constants';

class LiankaoSchoolReport extends React.Component {
    constructor(props){
        super(props);

    }
    onHeaderMouseEnter(){

    }
    onHeaderMouseLeave() {

    }
    render() {
        return (
            <div style={{ display: 'inline-block', height: 340, padding: '0 10px 0 10px'}}  className='col-lg-4'>
                {/*<div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px', position: 'relative'}}>
                    <div id='schoolReportHeader' onMouseEnter={this.onHeaderMouseEnter} onMouseLeave={this.onHeaderMouseLeave} style={{ height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer' }}>
                        <span style={{ color: '#333', fontSize: 16, marginRight: 10 }}>联考分析报告</span>
                        <span style={{ float: 'right', color: '#bfbfbf' }}><i className='icon-right-open-2'></i></span>
                    </div>
                    <ReactHighcharts config={config} style={{ maxWidth: 330, maxHeight: 235, marginTop:20 }}></ReactHighcharts>
                </div>
                */}
                <div className={dashboardStyle['liankao-report-img']}></div>
            </div>
        )
    }
}
export default Radium(LiankaoSchoolReport);
