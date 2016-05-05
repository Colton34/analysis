/*
* @Author: HellMagic
* @Date:   2016-04-11 19:12:00
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 20:43:00
*/

'use strict';

/*
Header肯定是一直需要user的，而Header是所有的View都需要的，而把user放在global_state里

 */

import Immutable, {Record} from 'immutable';

const InitialState = Record({
    user: {},//前端需要知道user的基本信息，而且还需要匹配权限
    isLoading: false
});

export default InitialState;
