import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function loginReducer(state = initialState.authenticated, action) {
    switch (action.type){
        case types.AUTHENTICATE_USER_SUCCESS:
            return {
                authenticated: true,
                data: action.data.data
            };
        case types.AUTHENTICATION_ERROR:
            return {
                authenticated: false,
                data: {}
            };
        case types.LOG_OUT:
            return Object.assign({}, initialState.authenticated);
        default:
            return state;
    }
}