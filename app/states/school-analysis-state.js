/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-03 10:06:46
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    levels: Map({}),
    levelBuffers: List([]),
    forseUpdate: false
});

export default InitialState;
