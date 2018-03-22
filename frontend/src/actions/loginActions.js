import axios from 'axios';

import {beginAjaxCall, ajaxCallError} from "./ajaxStatusActions";
import * as actions from './actionTypes';
import {getToken} from "../localStorage";
import {loadInstances} from "./loadInstancesActions";

export function signinUser({email, password}) {
    return dispatch => {
        // Submit email and password to server
        dispatch(beginAjaxCall());
        return axios.post(`/api/login`, {email, password})
            .then(response => {
                // - Save the JWT in localStorage
                localStorage.setItem('token', response.data.data.token);
                dispatch({type: actions.AUTHENTICATE_USER_SUCCESS, data: response.data});
                dispatch(loadInstances());
                // setCheckAuthInterval(dispatch);
            })
            .catch(error => {
                // If request is bad show an error to the user
                dispatch(ajaxCallError());
                const errMsg = error.response.data.message || error.response.statusText;
                dispatch({type: actions.AUTHENTICATION_ERROR});
                return Promise.reject(errMsg);
            });
    }
}

export function logOut() {
    localStorage.setItem('token', '');
    return {type: actions.LOG_OUT}
}

export function checkAuth() {
    return dispatch => {
        return getToken().then(config => {
            dispatch(beginAjaxCall());
            return axios.get(`/api/verify-token`, config)
                .then(response => {
                    // If request is good update state - user is authenticated
                    dispatch({type: actions.AUTHENTICATE_USER_SUCCESS, data: response.data, authenticated: true});
                    // - Save the JWT in localStorage
                    localStorage.setItem('token', response.data.data.token);
                    dispatch(loadInstances());
                })
                .catch(error => {
                    dispatch(ajaxCallError());
                    dispatch({type: actions.AUTHENTICATION_ERROR});
                    localStorage.setItem('token', '');
                    return Promise.reject(error);
                });
        })
            .catch(error => {
                dispatch({type: actions.AUTHENTICATION_ERROR});
                localStorage.setItem('token', '');
                return Promise.reject(error);
            });
    };
}
//
// export function setCheckAuthInterval(dispatch) {
// 	window.checkAuthInterval = setInterval(() => {
// 		dispatch(checkAuth())
// 			.catch(() => {
// 				clearInterval(window.checkAuthInterval);
// 			});
// 	}, 7000); // Check if user is logged in every 10 minutes
// }