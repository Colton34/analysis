import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap'
import style from './Header.css';

//直接使用<Modal.Header />语法则会有“Property object of JSXMemberExpression expected node to be of。。。”的错误，因为
//babel-transform对此编译支持的原因，详见：https://phabricator.babeljs.io/T6662，所以一律写成这种语法
var {Header, Title, Body, Footer} = Modal;


/*
TODO: 清理这里没用的代码

 */

let headerLinks = ['首页', '分析'];
const HeaderMenu = () => {
    return (
        <ul className={style.menu}>
            {
                headerLinks.map((link, index) => {
                    return (
                        <li key={index} className={style['menu-li']}>
                            <a href="javascript:void(0)" className={style['menu-nav']} title={link}>{link}</a>
                        </li>
                    )
                })
            }
        </ul>
    )
}

const HeaderUser = () => {
    return (
        <ul className={style['user-center']}>
            <li>
                <a href='javascript:void(0)' className={style.user}>
                    <div className={style['user-avatar']}>
                        <div className={style['user-avatar-img']} />
                    </div>
                    <div className='caret' style={{marginLeft: 50}}>v</div>
                </a>
            </li>
        </ul>
    )
}


const CommentModal = ({modalActiveStatus, actions}) => {
    console.log('inside modal:' + JSON.stringify(modalActiveStatus));
    return (
        <Modal show={modalActiveStatus.active} onHide={actions.alterCommentDialogStatus}>
            <Header closeButton>
            <Title></Title>
          </Header>
          <Body>

          </Body>
          <Footer>
            <Button>发送</Button>
            <Button>取消</Button>
          </Footer>
        </Modal>
    )
}

const HeaderComponent = ({user,commentActive, actions}) => {
    return (
        <div className={style.header}>
            <div className={style.wrapper}>
                <h1 className={style.title}>
                    <a className={style['title-a']} href='javascript:void(0)' title="好分数">好分数</a>
                </h1>
                <HeaderMenu/>
                <HeaderUser/>
                <a href="javascript:void(0)"  style={{float: 'right', textDecoration: 'none',color: '#5a5a5a', paddingLeft: 40, paddingTop:30}}>我要吐槽</a>


            </div>
        </div>
    )
};

Header.propTypes = {
    user: PropTypes.object.isRequired
};

export default HeaderComponent;

