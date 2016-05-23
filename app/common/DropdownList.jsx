import React from 'react';
import _ from 'lodash';

let style = {
    hide: {
        display: 'none'
    },
    btn: {
        display: 'inline-block', width:130,height:30,color:'#fff',lineHeight: '30px',textDecoration: 'none',textAlign:'center'
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0
    }
}
/**
 * props:
 * list: 下拉菜单列表
 * onClickDropdownList: 点击菜单项目时的回调
 */
class DropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            current: this.props.classList? this.props.classList[0] : '无数据',
            coveredItems: this.props.classList? this.props.classList.slice(1) : []
        }
    }
    toggleList () {
        this.setState({active: !this.state.active})
    }
    chooseItem (item) {
        this.setState({current: item, active: false, coveredItems: _.without(this.props.classList, item)});
        this.props.onClickDropdownList(item);
    }
    render() {
        var _this = this;
        return (
            <div>
                <a style={Object.assign({},style.btn,{backgroundColor:'#00c076'})} href="javascript:void(0)" onClick={this.toggleList.bind(this)}>
                    {this.state.current.value}
                </a >
                {this.props.classList ? (
                    <ul style={this.state.active? style.list : style.hide}>
                        {
                            _.map(_this.state.coveredItems, (item,index) => {
                                return (
                                    <li key={index}>
                                        <a style={Object.assign({},style.btn,{backgroundColor:'#f2f2f2',color: '#333'})} href="javascript:void(0)" onClick={this.chooseItem.bind(this,item)}>
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
