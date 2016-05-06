import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap'
import style from './Header.css';

let headerLinks = ['首页', '分析'];
const HeaderMenu = () => {
    return (
        <ul className={style.menu}>
            {
                headerLinks.map(link => {
                    return (
                        <li className={style['menu-li']}>
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
            <Modal.Header closeButton>
            <Modal.Title></Modal.Title>
          </Modal.Header>
          <Modal.Body>
          
          </Modal.Body>
          <Modal.Footer>
            <Button>发送</Button>
            <Button>取消</Button>
          </Modal.Footer>
        </Modal>
    )
}
 
const Header = ({user,commentActive, actions}) => {
    console.log('user:' + JSON.stringify(user));
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

export default Header;

