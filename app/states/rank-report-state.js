'use strict';

import Immutable, {
	Record,
	Map,
	List
} from 'immutable';

var InitialState = Record({
	haveInit: false,

	examInfo: {},
	rankCache: Map({})
	// rankInfo: Map({})

});

export default InitialState;
