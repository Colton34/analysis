/*
* @Author: HellMagic
* @Date:   2016-07-14 18:39:06
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-14 18:49:21
*/

'use strict';
import Immutable, {Record, Map, List} from 'immutable';

const InitialState = Record({
    one: Map({}),
    two: List([]),
    three: new Record({
        a: List([]),
        b: Map({}),
        c: 'c'
    })()
});

export default InitialState;
