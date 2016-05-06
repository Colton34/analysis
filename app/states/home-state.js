/*
* @Author: HellMagic
* @Date:   2016-05-04 20:33:15
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-06 17:52:00
*/

'use strict';

import Immutable, {Record, List, Map} from 'immutable';

const InitialState = Record({
    haveInit: false,
    examList: []
});

export default InitialState;
