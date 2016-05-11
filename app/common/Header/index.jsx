import React, {PropTypes} from 'react';
import style from './Header.css';
import {Link} from 'react-router';


/*
TODO: 清理这里没用的代码；补充完善所有的交互点--javascript(0)的地方
*/

// 需要补充其他产品的跳转链接
const HeaderMenu = () => {
    return (
        <ul className={style.menu}>
            <li className={style['menu-li']}>
                <Link to="/" className={style['menu-nav']}>首页</Link>
            </li>
        </ul>
    )
}

//TODO:这里有交互？需要展示学生的其他信息？
const HeaderUser = () => {
    return (
        <ul className={style['user-center']}>
            <li>
                <a href='javascript:void(0)' className={style.user}>
                    <div className={style['user-avatar']}>
                        <div className={style['user-avatar-img']} />
                    </div>
                    <div className='' style={{ width: 20,height: 20, marginLeft: 50 }}>v</div>
                </a>
            </li>
        </ul>
    )
}


let dialogProps = {
    title: '我要吐槽',
    content: <textarea  style={{width: 550, height:200}}></textarea>
}

const HeaderComponent = ({user, actions}) => {
    console.log('actions;' + actions);
    var _this = this;
    return (
        <div className={style.header}>
            <div className={style.wrapper}>
                <h1 className={style.title}>
                    <a className={style['title-a']} href='javascript:void(0)' title="好分数">好分数</a>
                </h1>
                <HeaderMenu />
                <HeaderUser/>
                <a href="javascript:void(0)"  onClick={actions.bind(_this, dialogProps)} style={{ float: 'right', textDecoration: 'none', color: '#5a5a5a', paddingLeft: 40, paddingTop: 30 }}>我要吐槽</a>
            </div>
        </div>
    )
};

HeaderComponent.propTypes = {
    user: PropTypes.object.isRequired
};

export default HeaderComponent;

