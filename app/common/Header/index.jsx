import React, {PropTypes} from 'react';
import style from './Header.css';
import {Link} from 'react-router';
import Radium from 'radium';

/*
TODO: 清理这里没用的代码；补充完善所有的交互点--javascript(0)的地方
*/

// 需要补充其他产品的跳转链接
@Radium
class HeaderMenu extends React.Component {
    render(){
        return (
            <ul className={style.menu}>
                <li className={style['menu-li']}>
                    <a href="/" className={style['menu-nav']} style={localStyle.headerLink} key={'headerLink-0'}>首页</a>
                </li>
            </ul>
        )
    }

}

//TODO:这里有交互？需要展示学生的其他信息？
const HeaderUser = ({onClickAvatar}) => {
    return (
        <ul className={style['user-center']}>
            <li>
                <a href='javascript:void(0)' className={style.user}>
                    <div className={style['user-avatar']} onClick={onClickAvatar}>
                        <div className={style['user-avatar-img']} />
                    </div>
                    <div className='' style={{ width: 20, height: 20, marginLeft: 50 }}>v</div>
                </a>
            </li>
        </ul>
    )
}


let dialogProps = {
    title: '我要吐槽',
    content: <textarea  style={{ width: 550, height: 200 }}></textarea>
}

@Radium
class DropdownMenu extends React.Component {

    render() {
        return (
            <ul id='header-dropdown' className={style['dropdown-menu']}>
                <li style={localStyle.listItem}>
                    <a href='javascript: void(0)' className={style['dropdown-link']} style={localStyle.listLink} onClick={this.props.onLogout}>
                        退出登录
                    </a>
                </li>
            </ul>
        )
    }
}


class HeaderComponent extends React.Component {
    //({user, actions}) =>
    constructor(props) {
        super(props);
        this.state = {
            showDropdown: false
        }
    }
    onClickAvatar() {
        this.setState({
            showDropdown: !this.state.showDropdown
        })
    }
    onLogout() {
        var Cookies = require('cookies-js');
        var options = (_.includes(window.location.hostname, 'yunxiao')) ? { domain: '.yunxiao.com'} : {};
        Cookies.expire('authorization', options);
        window.location = '/';
    }
    componentDidMount() {
        $('body').click((event)=> {
            if($(event.target).parents('#header-dropdown').length === 0){
                this.setState({
                    showDropdown: false
                })
            }
        })
    }
    render() {
        var _this = this;

console.log('user.name = ', this.props.user.realName);

        return (
            <div className={style.header}>
                <div className={style.wrapper}>
                    <h1 className={style.title}>
                        <a className={style['title-a']} href='javascript:void(0)' title="好分数">好分数</a>
                    </h1>
                    <HeaderMenu />
                    <HeaderUser onClickAvatar={this.onClickAvatar.bind(this)}/>
                    <a href="javascript:void(0)"  onClick={this.props.actions.bind(_this, dialogProps) } style={{ float: 'right', textDecoration: 'none', color: '#5a5a5a', paddingLeft: 40, paddingTop: 30 }}>我要吐槽</a>
                    { this.state.showDropdown ? <DropdownMenu onLogout={this.onLogout.bind(this)}/> : ''}
                </div>
            </div>
        )
    }

};

var localStyle = {
    listItem: {
        height: 40,
        lineHeight: '40px'
    },
    listLink: {
        ':hover': { textDecoration: 'none',backgroundColor: '#f5f5f5',color: '#999'}
    },
    headerLink: {
        ':hover': { textDecoration: 'none'}
    }
}
HeaderComponent.propTypes = {
    user: PropTypes.object.isRequired
};

export default HeaderComponent;

