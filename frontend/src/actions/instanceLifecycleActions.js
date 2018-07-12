import axios from 'axios';
import * as actions from './actionTypes';
import {ajaxCallError, beginAjaxCall} from "./ajaxStatusActions";
import {getToken} from "../localStorage";

export function toggleInstance(instance, status) {
    return function (dispatch) {
        return getToken().then(authConfig => {
            dispatch(beginAjaxCall());
            let requestBody = {status, id: instance.id, region: instance.zone.slice(0, -1)};
            if (instance.lifeCycle === "fleet") {
              requestBody.ip = instance.ip;
            }
            return axios.post(`/api/instances/${instance.lifeCycle}`, requestBody, authConfig)
                .then(e => {
                    dispatch({type: actions.TOGGLE_INSTANCE_SUCCESS});
                    return e.data;
                })
                .catch(err => {
                    dispatch(ajaxCallError());
                    return Promise.reject(err.response);
                });
        }).catch(err => {
            if (err.status === 401){
                return dispatch({type: actions.AUTHENTICATION_ERROR});
            }
            return Promise.reject(err.data);
        });
    }
}