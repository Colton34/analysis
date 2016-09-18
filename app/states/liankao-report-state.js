/*
* @Author: HellMagic
* @Date:   2016-09-17 19:51:54
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-17 19:52:40
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfo: Map({}),
    examStudentsInfo: List([]),
    examPapersInfo: Map({}),
    examClassesInfo: Map({}),
    levels: Map({}),
    subjectLevels: Map({}),
    levelBuffers: List([])
});

export default InitialState;
