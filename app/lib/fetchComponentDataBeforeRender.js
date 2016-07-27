/*
* @Author: liucong
* @Date:   2016-03-31 11:19:09
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-07-19 16:55:00
*/
import _ from 'lodash';

import {initParams} from '../lib/util';
import axios from 'axios';

var config = require('../../server/config/env');
var http_port = process.env.HTTP_PORT || config.port;

var request = axios.create({
  baseURL: 'http://localhost:' + http_port + '/api/v1'
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
    return Promise.all(promises);
}
