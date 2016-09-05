/*
* @Author: HellMagic
* @Date:   2016-04-08 17:09:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-05 20:26:29
*/

'use strict';
import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfoGuide: {},
    scoreRank: {},
    schoolReport: {},
    classReport: {},
    subjectReport: {}
});

export default InitialState;
