/*
* @Author: HellMagic
* @Date:   2016-05-04 11:14:13
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-30 11:06:27
*/

'use strict';


//TODO: 这里添加levelBuffers

import Immutable, {Record, Map, List} from 'immutable';

var InitialState = Record({
    haveInit: false,

    examInfo: {},
    examStudentsInfo: [],
    examPapersInfo: {},
    examClassesInfo: {},
    studentsGroupByClass: {},
    allStudentsPaperMap: {},
    headers: [],
    levels: {},
    levelBuffers: []
});

export default InitialState;
