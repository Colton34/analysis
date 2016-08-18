/*
* @Author: HellMagic
* @Date:   2016-08-17 08:30:22
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-17 17:36:00
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examList: List([]),
    examsInfoCache: List([])
})

export default InitialState
