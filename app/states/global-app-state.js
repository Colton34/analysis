/*
* @Author: HellMagic
* @Date:   2016-04-11 19:12:00
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 11:35:12
*/

'use strict';

import Immutable, {Record} from 'immutable';

const InitialState = Record({
    user: {},
    isLoading: false
});

export default InitialState;
