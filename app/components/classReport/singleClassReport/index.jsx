import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import ClassNav from './ClassNav';
import HeaderInfo from './HeaderInfo';
import ModuleNav from './ModuleNav';

class SingleClassReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentClass: 'one'
        }
    }

    chooseClass(className) {
        this.setState({
            currentClass: className
        })
    }

//Note: 当前先打散，而没有再在结构上进行重组，后面结构化更清晰了会考虑进一步重组。
    render() {
        return (
            <div>
                <h3>SingleClassReport</h3>
                <HeaderInfo examInfo={this.props.reportDS.examInfo} />
                <ModuleNav />
                {/* ... */}
            </div>
        );
    }
}

export default SingleClassReport;


//=================================================  分界线  =================================================


/* <ClassNav chooseClass={this.chooseClass.bind(this)} />  -- 被砍掉 */
