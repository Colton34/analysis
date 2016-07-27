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
