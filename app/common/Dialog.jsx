import React from 'react';
//import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import {alterCommentDialogStatus} from '../reducers/global-app/actions';
import { bindActionCreators } from 'redux';
import styles from './common.css';
//直接使用<Modal.Header />语法则会有“Property object of JSXMemberExpression expected node to be of。。。”的错误，因为
//babel-transform对此编译支持的原因，详见：https://phabricator.babeljs.io/T6662，所以一律写成这种语法
var {Header, Title, Body, Footer} = Modal;

let localStyle= {
    okBtn: {
        width: 200,
        height: 50
    }
}
class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log('Dialog receive:' + JSON.stringify(this.props));
        var dialog = this.props.dialog;
        return (
            <Modal show={ dialog.show } ref="dialog"  onHide={this.props.onHide} className={dialog.className?dialog.className+" yx-modal":"yx-modal"}>
                <Header closeButton={true}>
                    {dialog.title && <Title>{dialog.title}</Title>}
                </Header>
                <Body className="apply-content">
                    {dialog.content}
                </Body>
                
                {dialog.okButton&&<Footer className="text-center"><a href="javascript:void(0)" style={{width: 200, height: 50,  display: 'inline-block',textAlign: 'center',textDecoration: 'none', backgroundColor:'#f2f2f2'}} onClick={this.okClickHandler}>{dialog.okLabel}</a></Footer>}

            </Modal>
        )
    }
}
function mapStateToProps(state) {
    return {
        dialog: state.app.dialog
    }
}
function mapDispatchToProps(dispatch) {
    return{
         onHide: bindActionCreators(alterCommentDialogStatus, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Dialog);