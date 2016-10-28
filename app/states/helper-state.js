/*
* @Author: HellMagic
* @Date:   2016-10-13 21:12:59
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-10-28 18:57:46
*/

'use strict';

import {Record, Map, List} from 'immutable';

const InitialState = Record({
    haveInit: false,
    equivalentScoreInfoList: List([])
});

export default InitialState;
