import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

import {HELPER_TITLE_MAP as helperTitleMap} from '../lib/constants';

function HelperBoxNav({title}) {
    return (
        <div style={{ width: 1200,height:50, margin: '0 auto', marginTop: 20, backgroundColor: '#fff', zIndex: 0,paddingTop:20}} className='animated fadeIn'>
            <Link to={{pathname: '/dashboard'}} style={{color:'#333'}}>返回</Link>
            <span style={{color:'#000',marginLeft:'500px',fontSize:'18px'}}>{title}</span>
        </div>
    )
}

export default class HelperBoxContainer extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                <HelperBoxNav title={helperTitleMap[this.props.params.name]} />
                {this.props.children}
            </div>
        );
    }
}
