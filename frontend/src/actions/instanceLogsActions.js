import axios from 'axios';
import * as actions from './actionTypes';
import { ajaxCallError, beginAjaxCall } from "./ajaxStatusActions";
import { getToken } from "../localStorage";

export function addServerLogs(srv, name) {
  return { type: actions.ADD_SERVER_LOGS, srv, name };
}

export function removeServerLogs(srv) {
  return { type: actions.REMOVE_SERVER_LOGS, srv };
}

export function addRequestedLogs(srv, log) {
  return { type: actions.ADD_REQ_LOG, srv, log, };
}

export function removeRequestedLogs(srv, log) {
  console.log(log);
  return { type: actions.REMOVE_REQ_LOG, srv, log, };
}

export function getInstanceLogs(srv, path) {
  return function (dispatch) {
    return getToken().then(authConfig => {
      dispatch(beginAjaxCall());
      const requestBody = { path, srv };

      return axios.post(`/api/get/root-logs`, requestBody, authConfig)
        .then(e => {
          dispatch({ type: actions.LOGS_DIR_SUCCESS });
          return e.data;
        })
        .catch(err => {
          dispatch(ajaxCallError());
          return Promise.reject(err.response);
        });
    }).catch(err => {
      if (err.status === 401) {
        return dispatch({ type: actions.AUTHENTICATION_ERROR });
      }
      return Promise.reject(err.data);
    });
  }
}

export function catLog(srv, log, page) {
  return function (dispatch) {
    return getToken().then(authConfig => {
      dispatch(beginAjaxCall());
      let requestBody = { log, srv };
      if (page) {
        requestBody.page = page;
      }
      return axios.post(`/api/get/cat-log`, requestBody, authConfig)
        .then(e => {
          dispatch({ type: actions.CAT_LOG_SUCCESS });
          return e.data;
        })
        .catch(err => {
          dispatch(ajaxCallError());
          return Promise.reject(err.response);
        });
    }).catch(err => {
      if (err.status === 401) {
        return dispatch({ type: actions.AUTHENTICATION_ERROR });
      }
      return Promise.reject(err.data);
    });
  }
}

export function grepLog(srv, log, searchQuery) {
  return function (dispatch) {
    return getToken().then(authConfig => {
      dispatch(beginAjaxCall());
      let requestBody = { log, srv, searchQuery };
      return axios.post(`/api/get/grep-log`, requestBody, authConfig)
        .then(e => {
          dispatch({ type: actions.GREP_LOG_SUCCESS });
          return e.data;
        })
        .catch(err => {
          dispatch(ajaxCallError());
          return Promise.reject(err.response);
        });
    }).catch(err => {
      if (err.status === 401) {
        return dispatch({ type: actions.AUTHENTICATION_ERROR });
      }
      return Promise.reject(err.data);
    });
  }
}