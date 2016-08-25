import React from 'react';
import _ from 'lodash';
import Radium from 'radium';
import {COLORS_MAP as colorsMap} from '../lib/constants';

let localStyle = {
    hide: {
        display: 'none'
    },
    btn: {
        display: 'inline-block', minWidth:90, height:30,color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center',borderRadius:2
    },
    dropDownBtn: {
        display: 'inline-block', width:'100%',height:'100%',lineHeight: '30px',textDecoration: 'none',textAlign:'center',borderRadius: 3, backgroundColor:'#fff',color: '#333',
        ':hover': {textDecoration: 'none', backgroundColor: colorsMap.C03}
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        borderRight: '1px solid ' + colorsMap.C04,
        borderLeft: '1px solid ' + colorsMap.C04,
        borderBottom: '1px solid ' + colorsMap.C04
    },
    surfaceBtn: {
        backgroundColor: '#fff', color: colorsMap.B03, border: '1px solid ' + colorsMap.B03, position: 'relative', paddingLeft: 8
    }

}
/**
 * props:
 * list: 下拉菜单显示项目
 * onClickDropdownList: 点击菜单项目时的回调
 * isMultiChoice: 是否多选；
 * multiChoiceNum: 可选，多选的数量,
 * surfaceBtnStyle: 下拉列表对外按钮的样式,
 * coverAll: cover列表里是否包含全部候选（包括已选择的）, 默认为否;
 * needRefresh：在componentWillReceiveProps时是否更新列表；
 * dropdownListRefreshHandler： 更新props中的needRefresh字段的回调函数；
 * handleSelectedItems: 下拉菜单收缩时返回当前选中元素的回调函数；
 */
@Radium
class DropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.multiChoiceNum = this.props.multiChoiceNum ? this.props.multiChoiceNum : this.props.list.length;
        var theDropCount = (this.props.list.length >= 2) ? 2 : 1;
        if (this.props.isMultiChoice) {
            _.each(_.range(theDropCount), index => { //默认选择前两个
                this.props.list[index].selected = true;
            })
        }
        this.state = {
            active: false,
            current: this.props.isMultiChoice ? {value:'选择班级'} : this.props.list? this.props.list[0] : {value:'无数据'},
            coveredItems: this.props.isMultiChoice || this.props.coverAll? this.props.list :this.props.list.slice(1),
            selectedItems: this.props.list.slice(0, theDropCount)
        }
    }
    componentWillReceiveProps(nextProps) {
        if (!nextProps.needRefresh){
            return;
        } 
             
        this.multiChoiceNum = nextProps.multiChoiceNum ? nextProps.multiChoiceNum :nextProps.list.length;
        var theDropCount = (nextProps.list.length >= 2) ? 2 : 1;
        if (nextProps.isMultiChoice) {
            _.each(_.range(theDropCount), index => { //默认选择前两个
                nextProps.list[index].selected = true;
            })
        }
        
        this.setState({
            active: false,
            current: nextProps.isMultiChoice ? {value:'选择班级'} : nextProps.list? nextProps.list[0] : {value:'无数据'},
            coveredItems: nextProps.isMultiChoice || nextProps.coverAll? nextProps.list :nextProps.list.slice(1),
            selectedItems: nextProps.list.slice(0, theDropCount)
        })
        if (nextProps.dropdownListRefreshHandler){
            nextProps.dropdownListRefreshHandler()
        }
    }
    handleBodyClick(event) {
        if($(event.target).parents('#dropdownList').length === 0) {
            this.setState({
                active: false
            })
            this.props.handleSelectedItems && this.props.handleSelectedItems(this.state.selectedItems);
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
                var {selectedItems} = this.state;
                if (selectedItems.length >= this.multiChoiceNum) return;
                item.selected = true;
                var {selectedItems} = this.state;
                selectedItems.push(item);
                this.setState({
                    selectedItems: selectedItems
                })

            }
        } else if(this.props.coverAll){
            this.setState({current: item, active: false, coveredItems: this.props.list});
        }else{
            this.setState({current: item, active: false, coveredItems: _.without(this.props.list, item)});
        }
        this.props.onClickDropdownList && this.props.onClickDropdownList(item);
        console.log('dropdown list, click: ' + item.value)
    }
    render() {
        var {surfaceBtnStyle, style} = this.props;
        var _this = this;
        return (
            <div id='dropdownList' style={_.assign({textAlign: 'center'}, style ? style : {})}>
                <a style={_.assign({}, localStyle.btn, localStyle.surfaceBtn, surfaceBtnStyle? surfaceBtnStyle : {})} href="javascript:void(0)" onClick={this.toggleList.bind(this)}>
                    <span style={{}}>{this.state.current.value}</span>
                    <i className='icon-down-open-3'></i>
                </a >
                {this.props.list ? (
                    <ul style={this.state.active? localStyle.list : localStyle.hide}>
                        {
                            _.map(_this.state.coveredItems, (item,index) => {
                                var selectedStyle = item.selected ? {backgroundColor: colorsMap.C03}: {};
                                return (
                                    <li key={index} style={{minWidth: 90, height: 30, backgroundColor: '#fff'}}>
                                        <a  key={'ddAtag-' + index}
                                            style={[localStyle.dropDownBtn, selectedStyle]}
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
