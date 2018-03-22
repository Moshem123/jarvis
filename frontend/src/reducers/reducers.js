import { combineReducers } from 'redux';
import instances from './instancesReducer';
import authenticated from './loginReducer';
import ajaxStatus from './ajaxStatusReducer';
import logs from './logsReducer';

const rootReducer = combineReducers({
  instances,
  authenticated,
  ajaxStatus,
  logs,
});

export default rootReducer;