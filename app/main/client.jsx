import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import createRoutes from './routes';
import configureStore from './store';
import axios from 'axios';
import Cookies from 'cookies-js';

const initialState = window.__INITIAL_STATE__;

window.request = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  // timeout: 1000,
  headers: {'x-access-token': Cookies.get('authorization')}
});
console.log('initialState : ', initialState);

const store = configureStore(initialState, browserHistory);
const history = syncHistoryWithStore(browserHistory, store);
const routes = createRoutes(store);

render(
  <Provider store={store}>
    <Router history={history}>
        {routes}
    </Router>
  </Provider>, document.getElementById('app'));
