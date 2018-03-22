import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function logsReducer(state = initialState.logs, action) {
  switch (action.type) {
    case types.ADD_SERVER_LOGS:
      return {
        ...state,
        [action.srv]: {name: action.name, logs: []}
      };
    case types.REMOVE_SERVER_LOGS: {
      let logs = { ...state };
      delete logs[action.srv];
      return logs;
    }
    case types.ADD_REQ_LOG: {
      const newLogs = state[action.srv].logs.slice();
      newLogs.push(action.log);
      return {
        ...state,
        [action.srv]: {name: state[action.srv].name, logs: newLogs}
      };
    }
    case types.REMOVE_REQ_LOG: {
      console.log(state);
      console.log(action);
      const newLogs = state[action.srv].logs.slice();
      newLogs.splice(newLogs.indexOf(action.log),1);
      return {
        ...state,
        [action.srv]: {name: state[action.srv].name, logs: newLogs}
      };
    }
    default:
      return state;
  }
}