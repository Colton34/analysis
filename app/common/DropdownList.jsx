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
            current: this.props.list? this.props.list[0] : '无数据',
            coveredItems: this.props.list? this.props.list.slice(1) : []
        }
    }
    toggleList () {
        this.setState({active: !this.state.active})
    }
    chooseItem (content) {
        this.setState({current: content, active: false, coveredItems: _.without(this.props.list, content)});
        this.props.onClickDropdownList(content);
    }
    render() {
        var _this = this;
        return (
            <div>
                <a style={Object.assign({},style.btn,{backgroundColor:'#00c076'})} href="javascript:void(0)" onClick={this.toggleList.bind(this)}>
                    {this.state.current}
                </a >
                {this.props.list ? (
                    <ul style={this.state.active? style.list : style.hide}>
                        {
                            _this.state.coveredItems.map((item,index) => {
                                return (
                                    <li key={index}>
                                        <a style={Object.assign({},style.btn,{backgroundColor:'#f2f2f2',color: '#333'})} href="javascript:void(0)" onClick={this.chooseItem.bind(this,item)}>
                                        {item}
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