import React from 'react';
import _ from 'lodash';
import Radium from 'radium';
import {COLORS_MAP as colorsMap} from '../lib/constants';

let style = {
    hide: {
        display: 'none'
    },
    btn: {
        display: 'inline-block', minWidth:90, height:30,color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center'
    },
    dropDownBtn: {
        display: 'inline-block', width:'100%',height:'100%',color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center',borderRadius: 3,
        ':hover': {textDecoration: 'none', backgroundColor: colorsMap.C03}
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        borderRight: '1px solid ' + colorsMap.C04,
        borderLeft: '1px solid ' + colorsMap.C04,
        borderBottom: '1px solid ' + colorsMap.C04
    }
}
/**
 * props:
 * list: 下拉菜单显示项目
 * onClickDropdownList: 点击菜单项目时的回调
 * isMultiChoice: 是否多选；
 * multiChoiceNum: 可选数量，默认为2
 */
@Radium
class DropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.multiChoiceNum = this.props.multiChoiceNum ? this.props.multiChoiceNum : this.props.classList.length;
        if (this.props.isMultiChoice) {
            var theDropCount = (this.props.classList.length >= 2) ? 2 : 1;
            _.each(_.range(theDropCount), index => { //默认选择前两个
                this.props.classList[index].selected = true;
            })
        }
        this.state = {
            active: false,
            current: this.props.isMultiChoice ? {value:'选择班级'} : this.props.classList? this.props.classList[0] : {value:'无数据'},
            coveredItems: this.props.isMultiChoice ? this.props.classList :this.props.classList.slice(1),
            selectedItems: this.props.classList.slice(0, this.multiChoiceNum)
        }
    }
    handleBodyClick(event) {
        if($(event.target).parents('#dropdownList').length === 0) {
            this.setState({
                active: false
            })
         }
    }
    componentDidMount() {
        this.clickHandlerRef = this.handleBodyClick.bind(this);
        $('body').bind('click', this.clickHandlerRef);

    }
    componentWillUnmount() {
        $('body').unbind('click', this.clickHandlerRef);
    }
    toggleList () {
        this.setState({active: !this.state.active})
    }
    chooseItem (item) {
        if (this.props.isMultiChoice){
            if (item.selected) {
                item.selected = false;
                this.setState({
                    selectedItems: _.without(this.state.selectedItems, item)
                })
            } else {
                item.selected = true;
                var {selectedItems} = this.state;
                selectedItems.push(item);
                this.setState({
                    selectedItems: _.takeRight(selectedItems, this.multiChoiceNum)
                })

            }
        } else {
            this.setState({current: item, active: false, coveredItems: _.without(this.props.classList, item)});
        }
        this.props.onClickDropdownList(item);
    }
    render() {
        var _this = this;
        return (
            <div id='dropdownList'>
                <a style={[style.btn,{backgroundColor: '#fff', color: colorsMap.A12, border: '1px solid ' + colorsMap.A12, position: 'relative', paddingLeft: 8}]} href="javascript:void(0)" onClick={this.toggleList.bind(this)}>
                    <span style={{}}>{this.state.current.value}</span>
                    <i className='icon-down-open-3' style={{}}></i>
                </a >
                {this.props.classList ? (
                    <ul style={this.state.active? style.list : style.hide}>
                        {
                            _.map(_this.state.coveredItems, (item,index) => {
                                var selectedStyle = item.selected ? {backgroundColor: colorsMap.C03}: {};
                                return (
                                    <li key={index} style={{minWidth: 90, height: 30, backgroundColor: '#fff'}}>
                                        <a  key={'ddAtag-' + index}
                                            style={[style.dropDownBtn,{backgroundColor:'#fff',color: '#333'}, selectedStyle]}
                                            href="javascript:void(0)" onClick={this.chooseItem.bind(this,item)}>
                                            {item.value}
                                        </a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                ) : ''}

            </div>
        )
    }
}

export default DropdownList;
