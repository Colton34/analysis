import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';//这个只是为了测试dialog用的，如果不用的话可以考虑删除并且uninstall。
import style from './Header.css';
import {Link} from 'react-router';

//直接使用<Modal.Header />语法则会有“Property object of JSXMemberExpression expected node to be of。。。”的错误，因为
//babel-transform对此编译支持的原因，详见：https://phabricator.babeljs.io/T6662，所以一律写成这种语法
var {Header, Title, Body, Footer} = Modal;


/*
TODO: 清理这里没用的代码；补充完善所有的交互点--javascript(0)的地方
*/

// 需要补充其他产品的跳转链接
const HeaderMenu = () => {
    return (
        <ul className={style.menu}>
            <li className={style['menu-li']}>
                <Link to="/" className={style['menu-nav']}>首页</Link>
                <Link to="/" className={style['menu-nav']}>分析</Link>
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
                <HeaderMenu />
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

