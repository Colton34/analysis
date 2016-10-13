import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Radium from 'radium';
import {Link} from 'react-router';

// import QuestionModule from '../../components/zouban/QuestionModule';

export default class QuestionModule extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div>
                待填充
            </div>
        );
    }
}
