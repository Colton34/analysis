/*
* @Author: HellMagic
* @Date:   2016-04-08 17:09:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-17 14:19:31
*/

'use strict';
import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfoGuide: {},
    scoreRank: {},
    liankaoReport: {},
    schoolReport: {},
    classReport: {},
    subjectReport: []
});

export default InitialState;
