import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers/reducers';

const isProd = process.env.NODE_ENV === 'production';

const composeEnhancers = isProd ? compose : (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose);

const middleware = isProd
    ?
    [thunk] // Prod
    :
    [require('redux-immutable-state-invariant').default(), createLogger(), thunk];  // Dev


export default function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        composeEnhancers(applyMiddleware(...middleware))
    )
}