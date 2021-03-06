/*
* Redux middleware to handle promises
* As seen in: https://github.com/caljrimmer/isomorphic-redux-app
*/

import {REQUEST_SUFFIX, SUCCESS_SUFFIX, FAILURE_SUFFIX, LOADING_START, LOADING_DONE, THROW_ERROR, HIDE_ERROR, INIT_EXAMCACHE, GET_MORE_EXAMS_INFO} from '../lib/constants';

export default function promiseMiddleware() {
  return next => action => {
    const { promise, type, ...rest } = action;
    if (!promise) return next(action);

    const REQUEST = type + REQUEST_SUFFIX;
    const SUCCESS = type + SUCCESS_SUFFIX;
    const FAILURE = type + FAILURE_SUFFIX;

//Warning: just hack~ 对于loading部分需要重构。TODO: 重构设计！
    if(type != INIT_EXAMCACHE && type != GET_MORE_EXAMS_INFO) {
      next([{ ...rest, type: REQUEST }, {type: LOADING_START}]);
    } else {
      next({ ...rest, type: REQUEST });
    }

    return promise
      .then(res => {
        console.log('SUCCESS = ', SUCCESS);
        next([{ ...rest, res, type: SUCCESS }, {type: LOADING_DONE}, {type: HIDE_ERROR}]);
        return true;
      })
      .catch(error => {
        console.log('FAILURE = ', FAILURE);
console.log('=========================== 捕获到Promise Error: ', error);

        next([{ ...rest, error, type: FAILURE }, {type: LOADING_DONE}, {type: THROW_ERROR, error}]);
        return false;
      });
   };
}
