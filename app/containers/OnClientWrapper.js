/*
* @Author: HellMagic
* @Date:   2016-09-20 11:20:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-20 11:21:46
*/

'use strict';

import {Component} from 'react';
export const onClient = ComposedComponent => class extends Component {
    componentDidMount() {
       this.setState({onClient: true});
   }

   render() {
      <ComposedComponent onClient={this.state.onClient} />
   }
}
