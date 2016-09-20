/*
* @Author: HellMagic
* @Date:   2016-09-20 11:22:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-20 11:22:49
*/

'use strict';

import {Component} from 'react';
import {onClient} from './OnClientWrapper';

class MainContainer extends Component {
   render() {
      if (this.props.onClient) {
          return <Loader />
       }
      return <Placeholder />;
   }
}

export default onClient(MainContainer);
