/*
* @Author: liucong
* @Date:   2016-03-31 11:19:09
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-12 16:41:31
*/
import _ from 'lodash';

import {initParams} from '../lib/util';
import axios from 'axios';

var request = axios.create({
  baseURL: 'http://localhost:8666/api/v1'
  // timeout: 1000,
  // headers: {'x-access-token': Cookies.get('authorization')}
});

export function fetchComponentDataBeforeRender(dispatch, components, params, location, req) {
  if(!req.user) return Promise.reject(new Error('fetchComponentDataBeforeRender no req.user, should be login first and with token'));
  const needs = components.reduce((prev, current) => {
    return (current.need || [])
      // .concat((current.WrappedComponent ? current.WrappedComponent.need : []) || [])
      .concat(prev);
    }, []);

    if(!request.defaults.headers) request.defaults.headers = { common: {} };
    request.defaults.headers.common['x-access-token'] = req.user.token;
    params = initParams(params, location, {"_user": req.user, 'request': request});

    const promises = needs.map(need => dispatch(need(params)));

console.log('promise.length = ', promises.length);

    return Promise.all(promises);
}


//     params = params || {};
//     location.query = location.query || {};
//     params = _.merge(params, location.query);

//     params['_user'] = req.user;
// console.log('最终的params = ', params);
