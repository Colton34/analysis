/*
* @Author: HellMagic
* @Date:   2016-04-08 17:09:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 10:00:26
*/

'use strict';
import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfoGuide: {},
    scoreRank: {},
    schoolReport: {}
});

export default InitialState;
