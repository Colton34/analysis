//待重构！！！
import React from 'react';
import _ from 'lodash';
import Radium from 'radium';
import classNames from 'classnames';

import {COLORS_MAP as colorsMap} from '../lib/constants';
let btnMaxWidth = 120, btnMinWidth = 90, textWidth = 90;
let localStyle = {
    hide: {
        display: 'none'
    },
    btn: {
        display: 'inline-block', height:30,color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center',borderRadius:2
    },
    dropDownBtn: {
        display: 'inline-block', width:'100%',height:'100%',lineHeight: '30px',textDecoration: 'none',textAlign:'center',borderRadius: 3, backgroundColor:'#fff',color: '#333',
        ':hover': {textDecoration: 'none', backgroundColor: colorsMap.C03}
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: '-5px 0 0 0',
        lineHeight:'30px',
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
 * theTitle: 当是多选的时候显示的默认title name
 * initSelected: 初始化的默认选项
 * onClickDropdownList: 点击菜单项目时的回调
 * isMultiChoice: 是否多选；
 * multiChoiceNum: 可选，多选的数量。（是指最大可选择的数目，还是初始化的时候默认选择的数目。初始化默认选择的数目就是initSelectd，所以修改名字作为最大可供选择的数目）
 * surfaceBtnStyle: 下拉列表对外按钮的样式,
 * coverAll: cover列表里是否包含全部候选（包括已选择的）, 默认为否;
 * needRefresh：在componentWillReceiveProps时是否更新列表；
 * dropdownListRefreshHandler： 更新props中的needRefresh字段的回调函数；
 * handleSelectedItems: 下拉菜单收缩时返回当前选中元素的回调函数；
 * fixWidth: Bool: 下拉菜单宽度是否固定（超出款的显示省略号）;
 * noLimitInitCount: 默认是否限制初始选中的个数。如果设为true则不限制，全部选中。否则默认选中前两个；
 */
@Radium
class DropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.multiChoiceNum = this.props.multiChoiceNum ? this.props.multiChoiceNum : this.props.list.length;
        var theDropCount = (this.props.initSelected) ? this.props.initSelected.length : ((this.props.list.length >= 2) ? 2 : 1);
        if (this.props.isMultiChoice) {
            if(this.props.initSelected) {
                var targetKeys = _.map(this.props.initSelected, (obj) => obj.key);
                _.each(this.props.list, (obj) => {
                    if(_.includes(targetKeys, obj.key)) obj.selected = true;
                });
                debugger;
            } else {
                _.each(_.range(theDropCount), index => { //默认选择前两个
                    this.props.list[index].selected = true;
                })
            }
        }
        this.state = {
            active: false,
            current: this.props.isMultiChoice ? (this.props.theTitle ? {value: this.props.theTitle} : {value:'选择班级'}) : this.props.list? this.props.list[0] : {value:'无数据'},
            coveredItems: this.props.isMultiChoice || this.props.coverAll? this.props.list :this.props.list.slice(1),
            selectedItems: (this.props.initSelected) ? (_.filter(this.props.list, (obj) => obj.selected)) : this.props.list.slice(0, theDropCount)
        }
        debugger;
    }
    componentWillReceiveProps(nextProps) {
        debugger;
        if (!nextProps.needRefresh){
            return;
        }

        this.multiChoiceNum = nextProps.multiChoiceNum ? nextProps.multiChoiceNum :nextProps.list.length;
        if (nextProps.isMultiChoice) {
            if(nextProps.initSelected) {
                var targetKeys = _.map(nextProps.initSelected, (obj) => obj.key);
                _.each(nextProps.list, (obj) => {
                    if(_.includes(targetKeys, obj.key)) obj.selected = true;
                });
                debugger;
            } else {
                var theDropCount = (nextProps.list.length >= 2) ? 2 : 1;
                _.each(_.range(theDropCount), index => { //默认选择前两个
                    nextProps.list[index].selected = true;
                })
            }
        }

        debugger;

        this.setState({
            active: false,
            current: nextProps.isMultiChoice ? {value:'选择班级'} : nextProps.list? nextProps.list[0] : {value:'无数据'},
            coveredItems: nextProps.isMultiChoice || nextProps.coverAll? nextProps.list :nextProps.list.slice(1),
            selectedItems: (nextProps.initSelected) ? (_.filter(nextProps.list, (obj) => obj.selected)) : nextProps.list.slice(0, theDropCount)
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

        this.refs.list.className += ' hide'; // 配合下拉菜单的动画，需要先把列表隐藏；

    }
    componentWillUnmount() {
        $('body').unbind('click', this.clickHandlerRef);
    }
    toggleList () {
        this.setState({active: !this.state.active})
    }
    chooseItem (item) {
        debugger;
        var tempSelectedList = _.cloneDeep(this.state.selectedItems);
        if (this.props.isMultiChoice){
            if (item.selected) {
                _.remove(tempSelectedList, (target) => _.isEqual(target, item));
                item.selected = false;
debugger;
                this.setState({
                    selectedItems: tempSelectedList
                })
                debugger;
            } else {
                var {selectedItems} = this.state;
                if (selectedItems.length >= this.multiChoiceNum) return;
                item.selected = true;
                tempSelectedList.push(item);
                this.setState({
                    selectedItems: tempSelectedList
                })

            }
        } else if(this.props.coverAll){
            this.setState({current: item, active: false, coveredItems: this.props.list});
        }else{
            var tempList = _.cloneDeep(this.props.list);
            _.remove(tempList, (target) => _.isEqual(target, item));
            this.setState({current: item, active: false, coveredItems: tempList});
        }
        var param = (this.props.isMultiChoice) ? tempSelectedList : item;
        debugger;
        this.props.onClickDropdownList && this.props.onClickDropdownList(param);//这个为什么不能设置为当下拉收缩的时候才调用！！！
    }
    onAnimationEnd(e) {
        // 动画只能处理透明度，最终还要加一个 display: none
        if (e.animationName !== 'slideUp') return;

        this.refs.list.className += ' hide';
    }
    shouldShowTitle(showStr) {
        return showStr.length > 5;
    }
    render() {
        var {active, current} = this.state;
        var {surfaceBtnStyle, style, fixWidth} = this.props;
        var _this = this;
        var showTitle = !!(fixWidth && this.shouldShowTitle(current.value));
        console.log(this.props.list);
        debugger;
        return (
            <div id='dropdownList' style={_.assign({textAlign: 'center'}, style ? style : {})}>
                <a style={_.assign({}, localStyle.btn, localStyle.surfaceBtn, surfaceBtnStyle? surfaceBtnStyle : {},  showTitle ? {width: btnMaxWidth} : {minWidth: btnMinWidth})} href="javascript:void(0)" onClick={this.toggleList.bind(this)} data-title={showTitle ? current.value : ''} className={showTitle ? 'ellipsis-title':''}>
                    <span style={_.assign({},{position: 'relative', width: textWidth}, showTitle ?  {overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block'} : {})}>{this.state.current.value}</span>
                    <i className={classNames('icon-down-open-3', 'animated', {'caret-list-down': active, 'caret-list-up': !active})} style={{display: 'inline-block', float: 'right'}}></i>
                </a >
                {this.props.list ? (
                    <ul ref='list' onAnimationEnd={this.onAnimationEnd.bind(this)} style={_.assign({},localStyle.list, showTitle ? {margin: '-5px 0 0 0 ' }: {margin: 0})} className={classNames('animated', {'slide-down': active, 'slide-up': !active})}>
                        {
                            _.map(_this.state.coveredItems, (item,index) => {
                                var selectedStyle = item.selected ? {backgroundColor: colorsMap.C03}: {};
                                var showTitle = !!(fixWidth && this.shouldShowTitle(item.value));
                                return (
                                    <li key={index} style={_.assign({}, {height: 30, backgroundColor: '#fff', position: 'relative'}, showTitle ? {width: btnMaxWidth} : {minWidth: btnMinWidth})}>
                                        <a  key={'ddAtag-' + index}
                                            style={_.assign({},localStyle.dropDownBtn, selectedStyle, showTitle ? {overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'} : {})}
                                            href="javascript:void(0)" onClick={this.chooseItem.bind(this,item)}
                                            data-title={showTitle ? item.value : ''}
                                            className={showTitle ? 'ellipsis-title':''}>
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
