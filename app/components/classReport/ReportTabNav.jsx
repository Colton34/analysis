//“班级报告”和“班级间报告”的切换
import React, { PropTypes } from 'react';

import {COLORS_MAP as colorsMap} from '../../lib/constants';
import DropdownList from '../../common/DropdownList';

// style
import commonClass from '../../common/common.css'

class ReportTabNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ifShowMultiReport: false
        }
    }

    onClickReportNav(item) {
        if(item == 'multi') {
            this.setState({
                ifShowMultiReport: true
            });
            this.props.changeClassReport({type: 'multi'});
        } else {
            this.setState({
                ifShowMultiReport: false
            });
            this.props.changeClassReport({type: 'single', currentClass: item.key});
        }
    }

    render() {
        var {classesList} = this.props;
        return (
            <div className={commonClass['section']} style={{zIndex: 3, position: 'relative', width: '100%', height: 60, padding: 0, display: 'inline-block'}}>
                <span style={_.assign({}, localStyle.item, this.state.ifShowMultiReport  ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})} onClick={this.onClickReportNav.bind(this, 'multi')}>班级分析报告</span>
                <span style={_.assign({}, localStyle.item, !this.state.ifShowMultiReport ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})}>
                    <DropdownList style={{position:'relative'}} list={classesList} surfaceBtnStyle={_.assign({ border: 'none'}, !this.state.ifShowMultiReport ? {color: colorsMap.B03} : {color: colorsMap.C12})}
                                  onClickDropdownList={this.onClickReportNav.bind(this)} coverAll
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
