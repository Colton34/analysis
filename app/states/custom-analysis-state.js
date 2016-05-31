/*
* @Author: HellMagic
* @Date:   2016-05-30 19:01:29
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-31 11:42:30
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    papersInfo: Map({}),
    papersCache: Map({})
});

export default InitialState;
