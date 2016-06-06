import React from 'react';
import _ from 'lodash';
import Radium from 'radium';

let style = {
    hide: {
        display: 'none'
    },
    btn: {
        display: 'inline-block', width:130,height:30,color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center'
    },
    dropDownBtn: {
        display: 'inline-block', width:'100%',height:'100%',color:'#fff',lineHeight: '20px',textDecoration: 'none',textAlign:'center',borderRadius: 3,
        ':hover': {textDecoration: 'none', backgroundColor: '#dedede', color: '#fff'}
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0
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
        this.multiChoiceNum = this.props.multiChoiceNum ? this.props.multiChoiceNum : 2;
        _.each(_.range(this.multiChoiceNum), val => {
            this.props.classList[val].selected = true;
        })
        this.state = {
            active: false,
            current: this.props.isMultiChoice ? {value:'选择班级'} : this.props.classList? this.props.classList[0] : {value:'无数据'},
            coveredItems: this.props.isMultiChoice ? this.props.classList :this.props.classList.slice(1),
            selectedItems: this.props.classList.slice(0, this.multiChoiceNum)
        }
    }
    componentDidMount() {
        $('body').click(event => {
            if($(event.target).parents('#dropdownList').length === 0) {
                this.setState({
                    active: false
                })
            }
        })
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
                if (selectedItems.length > 1) {
                    selectedItems[0].selected = false;
                }
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
                <a style={[style.btn,{backgroundColor:'#00c076'}]} href="javascript:void(0)" onClick={this.toggleList.bind(this)}>
                    {this.state.current.value}
                </a >
                {this.props.classList ? (
                    <ul style={this.state.active? style.list : style.hide}>
                        {
                            _.map(_this.state.coveredItems, (item,index) => {
                                var selectedStyle = item.selected ? {backgroundColor: '#00c076', ':hover': {backgroundColor: '#b66c'}}: {};
                                return (
                                    <li key={index} style={{width: 130, height: 30, padding: 5, backgroundColor: '#fff'}}>
                                        <a  key={'ddAtag-' + index} 
                                            style={[style.dropDownBtn,{backgroundColor:'#f2f2f2',color: '#333'}, selectedStyle]} 
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
