/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-02 17:30:18
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    levels: {},
    levelBuffers: [],
    forseUpdate: false
});

export default InitialState;
