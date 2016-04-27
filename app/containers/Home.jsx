/*
* @Author: HellMagic
* @Date:   2016-04-09 22:19:16
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-09 22:19:41
*/

'use strict';
//路由container view，用来组织state object tree, 并connect redux and react

import React from 'react';
import {Link} from 'react-router';

class Home extends React.Component {
    constructor(props) {
      super(props);

    }

    render() {
        return (
            <div>
                <div>这里是Home</div>
                <Link to="/test">渲染图表</Link>
            </div>
        );
    }
}

export default Home;


