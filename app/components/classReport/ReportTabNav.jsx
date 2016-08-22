//“班级报告”和“班级间报告”的切换
import React, { PropTypes } from 'react';

import {COLORS_MAP as colorsMap} from '../../lib/constants';
import DropdownList from '../../common/DropdownList';

// style
import commonClass from '../../common/common.css'

class ReportTabNav extends React.Component {
    constructor(props) {
        super(props);
        var studentsGroupByClass = this.props.reportDS.studentsGroupByClass.toJS(), gradeName = this.props.reportDS.examInfo.toJS().gradeName;
        this.classesList = getClassesList(studentsGroupByClass, gradeName);
        this.state = {
            activeType: this.classesList[0].value
        }
    }
    onClickClassReportType(type) {
        this.setState({
            activeType: type
        })
        if (type === 'multi')
            this.props.changeClassReport(type);
        else
            this.props.changeClassReport('single')
    }
    render() {
        var {activeType} = this.state;
        var showMultiReport = activeType === 'multi';

        return (
            <div className={commonClass['section']} style={{zIndex: 3, position: 'relative', width: '100%', height: 60, padding: 0, display: 'inline-block'}}>
                <span style={_.assign({}, localStyle.item, showMultiReport  ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})} onClick={this.onClickClassReportType.bind(this, 'multi')}>班级分析报告</span>
                <span style={_.assign({}, localStyle.item, !showMultiReport ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})}>
                    <DropdownList style={{position:'relative'}} list={this.classesList} surfaceBtnStyle={_.assign({ border: 'none'}, !showMultiReport ? {color: colorsMap.B03} : {color: colorsMap.C12})}
                                  onClickDropdownList={this.onClickClassReportType.bind(this)} coverAll
                                  />
                </span>
            </div>
        );
    }
}

var localStyle = {
    item: {display: 'inline-block', height: 60, lineHeight: '60px', margin: '0 30px', float: 'left', cursor: 'pointer'}
}
export default ReportTabNav;

//=================================================  分界线  =================================================
function getClassesList(studentsGroupByClass, gradeName) {
    return _.map(studentsGroupByClass, (students, className) => {
        return {value: gradeName+className+'班-班级分析报告'}
    })
}
