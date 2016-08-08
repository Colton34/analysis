/*
* @Author: HellMagic
* @Date:   2016-08-02 16:36:20
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-08-08 10:07:55
*/

'use strict';

import Immutable, {Record, Map, List} from 'immutable';


//TODO:将这些封装到baseline中
    // headers: List([]),
    // levels: Map({}),
    // subjectLevels: List([]),
    // levelBuffers: List([]),
var InitialState = Record({
    haveInit: false,

    examInfo: Map({}),
    examStudentsInfo: List([]),
    examPapersInfo: Map({}),
    examClassesInfo: Map({}),
    studentsGroupByClass: Map({}),
    allStudentsPaperMap: Map({}),
    headers: List([]),
    levels: Map({}),
    subjectLevels: List([]),
    levelBuffers: List([]),

    forseUpdate: false //TODO：这个需要fix
});

export default InitialState;
