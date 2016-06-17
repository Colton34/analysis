import Immutable from 'immutable';

import {
	fetchRankReportdData
} from '../../api/exam';

import {
	INIT_RANKREPORT
} from '../../lib/constants';

export function initRankReportAction(params) {
	return {
		type: INIT_RANKREPORT,
		promise: fetchRankReportdData(params)
	}
}