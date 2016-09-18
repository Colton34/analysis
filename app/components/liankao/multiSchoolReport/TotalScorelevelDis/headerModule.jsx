import _ from 'lodash';
import React, { PropTypes } from 'react';

class HeaderModule extends React.Component {
    constructor(props) {
        super(props);

    }

    onClickChangeLevel() {
        //显示dialog；dialog里是一个form：a.通过redia来设置分档个数

    }

    render() {
        return (
            <div>
                <span>分档分数线</span>
                <button onClick={this.onClickChangeLevel.bind(this)}>设置分档</button>
            </div>
        );
    }
}
