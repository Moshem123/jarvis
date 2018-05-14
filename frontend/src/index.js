import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import throttle from 'lodash/throttle';
import merge from 'lodash/merge';

import 'font-awesome/css/font-awesome.min.css';
import 'izitoast/dist/css/iziToast.css';
import 'react-select/dist/react-select.css';
import './scss/main.scss';

import configureStore from './store/configureStore';
import App from './components/App';
import { loadState, saveState } from './localStorage'
import initialState from './reducers/initialState';
import { checkAuth } from "./actions/loginActions";

const persistedState = loadState();
const store = configureStore(merge(initialState, persistedState));

store.subscribe(throttle(() => {
  const state = store.getState();
  saveState({
    authenticated: state.authenticated,
    instances: { selectedInstances: state.instances.selectedInstances },
    viewType: state.viewType,
  });
}), 1000);

// store.dispatch(checkAuth());
// setCheckAuthInterval(store.dispatch);
setInterval(() => store.dispatch(checkAuth()), 300000);

render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>
  , document.querySelector('#app')
);