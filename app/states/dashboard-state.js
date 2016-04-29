/*
* @Author: HellMagic
* @Date:   2016-04-08 17:09:30
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-29 14:40:03
*/

'use strict';
import Immutable, {Record, Map, List} from 'immutable';

//如果是用Record就需要不断地更新schema，但是用Record有一个好处就是可以建立default值，这样减少出现undefined bug的几率
//这是route container所对应管理的state，会直接挂载到根节点上，作为container state被connect reducer

//1. 在state中创建对应的tree node
var InitialState = Record({
    examGuide: new Record({ //因为不牵涉到任何更新，所以可以考虑使用raw plain javascript
        subjectCount: 0,
        totoalProblemCount: 0,
        classCount: 0,
        totoalStudentCount: 0
    })(),
    scoreRank: {},
    classReport: Map(),
    levelReport: {},
    subjectReport: {}
});

export default InitialState;
