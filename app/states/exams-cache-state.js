/*
* @Author: HellMagic
* @Date:   2016-08-17 08:30:22
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-24 14:38:25
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    test: 'a',
    testList: List([]),


    isLoading: true,

    examsListCache: Map({}),
    examsInfoCache: Map({})
})

export default InitialState
