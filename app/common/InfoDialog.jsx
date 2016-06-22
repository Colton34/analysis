import React from 'react';
import { Modal } from 'react-bootstrap';
var {Header, Body} = Modal;

const InfoDialog = ({content, show, onHide}) => {
    return (
        <Modal show={ show } onHide={onHide} bsSize='sm'>
            <Header closeButton={true} style={{ fontWeight: 'bold', textAlign: 'center' }}>提示</Header>
            <Body style={{ textAlign: 'center' }}>
                {content}
            </Body>
        </Modal>
    )
}

export default InfoDialog;