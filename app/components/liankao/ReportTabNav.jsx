//“联考校内报告”和“联考校间总体报告”的切换
/*
    权限：教育局人员（特殊联考学校的校管理员）可以看到联考间总体报告和单个学校导航条，从而查看各个单个学校的报告
         参与联考的普通学校管理员：只能看到当前学校的联考校内分析报告--且没有导航条，且没有联考总体
    以上可以得出：如果是普通学校的管理员则没有此nav
 */
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
            this.props.changeSchoolReport({type: 'multi'});
        } else {
            this.setState({
                ifShowMultiReport: false
            });
            this.props.changeSchoolReport({type: 'single', currentClass: item.key});
        }
    }

    render() {
        return (
            <div className={commonClass['section']} style={{zIndex: 3, position: 'relative', width: '100%', height: 60, padding: 0, display: 'inline-block'}}>
                <span style={_.assign({}, localStyle.item, this.state.ifShowMultiReport  ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})} onClick={this.onClickReportNav.bind(this, 'multi')}>校间对比分析</span>
                <span style={_.assign({}, localStyle.item, !this.state.ifShowMultiReport ? {color: colorsMap.B03,borderBottom:'2px solid rgb(29, 174, 248)'}: {})}>
                    <DropdownList style={{position:'relative'}} list={this.props.schoolList} surfaceBtnStyle={_.assign({ border: 'none'}, !this.state.ifShowMultiReport ? {color: colorsMap.B03} : {color: colorsMap.C12})}
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

