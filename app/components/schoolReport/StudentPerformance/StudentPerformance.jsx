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
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }, {
            name: '卢俊义',
            class: '1班'
        }],
    lastTen: [
        {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }, {
            name: '宋江',
            class: '1班'
        }
    ]
}
/**
 * 传入 “前 或 后”  studentPosition
 * 学科列表 subjectList
 * 班级&成绩列表 classData
 * 
 */
class StudentPerformanceTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            current: this.props.dropList ? this.props.dropList[0] : '无数据',
            coveredItems: this.props.dropList ? this.props.dropList.slice(1) : [],
            inputNum: 0
        }
    }

    toggleList() {
        this.setState({ active: !this.state.active })
    }
    chooseItem(content) {
        this.setState({ current: content, active: false, coveredItems: _.without(this.props.dropList, content) });
    }
    onInputChange(event) {
        var value = event.target.value;
        if (!value || value <= 0) return;
        this.setState({
            inputNum : value
        })
    }
    render() {
        var _this = this;
        return (
            <div>
                {/* 下拉列表 */}
                <div style={{position: 'absolute', right: 180}}>
                    <a className={localStyle.btn} href="javascript:void(0)" onClick={this.toggleList.bind(this) }>
                        {this.state.current}
                    </a >
                    {this.props.dropList ? (
                        <ul className={this.state.active ? localStyle.list : localStyle.hide}>
                            {
                                _this.state.coveredItems.map((item,index) => {
                                    return (
                                        <li key={index}>
                                            <a style={Object.assign({}, localStyle.btn, { backgroundColor: '#f2f2f2', color: '#333' }) } href="javascript:void(0)" onClick={this.chooseItem.bind(this, item) }>
                                                {item}
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    ) : ''}
                </div>
                {/* 名次/比例输入框  */}
                <div style={{float: 'right', marginRight: -90, marginBottom: 10}}>
                    年级前<input onBlur={_this.onInputChange.bind(_this)} style={{ display: 'inline-block', width: 45, height: 22, lineHeight: '22px' }}/> {_this.state.current === '名次统计' ? '名' : '%'}
                </div>

                <table  style={{ border: '1px solid #d7d7d7', borderCollapse: 'collapse', width: '100%' }}>
                    <tbody>
                        <tr >
                            <th rowSpan="2" className={styles['table-unit']}>班级</th>
                            {
                                _this.props.subjectList.map((th,index) => {
                                    return (
                                        <th key={index} className={styles['table-unit']}>{th}</th>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            {
                                _this.props.subjectList.map((th, index) => {
                                    return (
                                        <th key={index} className={styles['table-unit']}>{_this.props.studentPosition + _this.state.inputNum + (_this.state.current === '名次统计' ? '名' : '%') }</th>
                                    )
                                })
                            }
                        </tr>
                        {
                            Object.keys(_this.props.classData).map(className => {
                                return (
                                    <tr>
                                        <td className={styles['table-unit']}>{className}</td>
                                        {
                                            _this.props.classData[className].map((data,index) => {
                                                return (
                                                    <td key={index} className={styles['table-unit']}>
                                                        {data}
                                                    </td>
                                                )
                                            })
                                        }
                                    </tr>
                                )

                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

var classData = {
    '初一一班': [78, 98, 32, 42, 28, 89, 21],
    '初一二班': [78, 98, 32, 42, 28, 89, 21],
    '初一三班': [78, 98, 32, 42, 28, 89, 21],
    '初一四班': [78, 98, 32, 42, 28, 89, 21]
}
const StudentPerformance = () => {
    return (
        <div className={styles['school-report-layout']}>
            <div style={{ borderBottom: '3px solid #C9CAFD', width: '100%', height: 30 }}></div>
            <div style={{ padding: '0 10px', position: 'absolute', left: '50%', marginLeft: -140, textAlign: 'center', top: 20, backgroundColor: '#fff', fontSize: 20, color: '#9625fc', width: 300 }}>
                学校有必要知道的学生重点信息
            </div>
            <div className={styles['school-report-content']}>
                <p>（1）这次考试，全校总分前后十名的学生是：</p>
                <div>
                    <div style={{ margin: '0 auto', width: 500 }}>
                        <div style={{ display: 'inline-block' }}>
                            <div className={localStyle['first-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #6dd0a8', margin: '0 auto' }}>
                                {
                                    studentList.firstTen.map((s,index) => {
                                        return (
                                            <div key={index} className={localStyle['student-box']}>
                                                <div style={{ fontSize: 14, color: '#3bba80' }}>{s.name}</div>
                                                <div style={{ fontSize: 12 }}>({s.class}) </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div style={{ display: 'inline-block', float: 'right' }}>
                            <div className={localStyle['last-ten']}></div>
                            <div style={{ width: 155, height: 260, border: '1px solid #f9b4a2', margin: '0 auto' }}>
                                {
                                    studentList.lastTen.map((s,index) => {
                                        return (
                                            <div key={index} className={localStyle['student-box']}>
                                                <div style={{ fontSize: 14, color: '#f68a72' }}>{s.name}</div>
                                                <div style={{ fontSize: 12 }}>({s.class}) </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{marginTop: 60}}>
                    <p>（2）全校各个班级在各个学科优秀的学生人数，见下表：</p>
                    <StudentPerformanceTable studentPosition={'前'} subjectList={['总分', '语文', '数学', '英语', '化学', '物理', '生物']}  classData={classData} dropList={['名次统计', '比例统计']}/>
                </div>
                <div style={{marginTop: 40}}>
                    <p>（3）全校各班级在各学科欠佳的学生数，如下表所示。希望相应班级任课教师多多帮助他们进步。</p>
                    <StudentPerformanceTable studentPosition={'后'} subjectList={['总分', '语文', '数学', '英语', '化学', '物理', '生物']}  classData={classData}  dropList={['名次统计', '比例统计']}/>
                </div>
            </div>

        </div>
    )

}


export default StudentPerformance;