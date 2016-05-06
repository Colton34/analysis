import React from 'react';
import styles from '../../../common/common.css';
import localStyle from './studentPerformance.css';
import ReactHighcharts from 'react-highcharts';
import _ from 'lodash';

let studentList = {
    firstTen: [
        {
            name: '宋江',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        },{
            name: '卢俊义',
            class: '1班' 
        }],
    lastTen: [
        {
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        },{
            name: '宋江',
            class: '1班' 
        }
    ]
}
const StudentPerformance = () => {
    return (
        <div className={styles['school-report-layout']}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ padding: '0 10px', position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 280 }}>
                学校有必要知道的学生重点信息
            </div>
            <div className={styles['school-report-content']}>
                <p>（1）这次考试，全校总分前后十名的学生是：</p>
                <div>
                    <div style={{margin:'0 auto', width: 500}}>
                        <div style={{ display: 'inline-block' }}>
                            <div className={localStyle['first-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #6dd0a8', margin: '0 auto' }}>
                            {
                                studentList.firstTen.map(s => {
                                    return (
                                        <div className={localStyle['student-box']}>
                                            <div style={{fontSize:14, color: '#3bba80'}}>{s.name}</div>
                                             <div style={{fontSize:12}}>({s.class})</div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                        <div style={{ display: 'inline-block', float:'right'}}>
                            <div className={localStyle['last-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #f9b4a2', margin: '0 auto' }}>
                            {
                                studentList.lastTen.map(s => {
                                    return (
                                        <div className={localStyle['student-box']}>
                                            <div style={{fontSize:14, color: '#f68a72'}}>{s.name}</div>
                                             <div style={{fontSize:12}}>({s.class})</div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default StudentPerformance;