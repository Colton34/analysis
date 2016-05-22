/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-22 16:24:33
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfo: {},
    examStudentsInfo: [],
    examPapersInfo: {},
    examClassesInfo: {},
    levels: {}
});

export default InitialState;
