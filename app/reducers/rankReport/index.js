'use strict';

import _ from 'lodash';

import InitialState from '../../states/rank-report-state';

var initialState = new InitialState;

import {
	INIT_RANKREPORT_SUCCESS
}
from '../../lib/constants';

export default function reducer(state, action) {
	if (_.isUndefined(state)) return initialState;
	if (!(state instanceof InitialState)) return initialState.merge(state);

	//TODO:注意，因为这里还没有替换成通过axois去异步获取数据，当使用axois的时候解析服务端的数据是 action.res.data而不是 action.res
	switch (action.type) {
		case INIT_RANKREPORT_SUCCESS:
			var nextState;
			_.each(action.res, function(value, key) {
				nextState = (nextState) ? nextState.set(key, value) : state.set(key, value);
			});
			return nextState.set('haveInit', true);
	}
	return state;
}
