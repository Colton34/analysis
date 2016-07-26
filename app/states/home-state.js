/*
* @Author: HellMagic
* @Date:   2016-05-04 20:33:15
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-26 10:35:07
*/

'use strict';

import Immutable, {Record, List, Map} from 'immutable';

const InitialState = Record({
    haveInit: false,
    errorInfo: {},

    examList: []
});

export default InitialState;
