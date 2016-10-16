/*
* @Author: HellMagic
* @Date:   2016-10-15 11:34:01
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-15 12:21:06
*/

'use strict';

import Immutable, {Record, List, Map} from 'immutable';

const InitialState = Record({
    haveInit: false,

    equivalentScoreInfo: Map({}),
    examStudentsInfo: List([])
});

export default InitialState;
