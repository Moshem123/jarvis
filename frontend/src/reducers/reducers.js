import { combineReducers } from 'redux';
import instances from './instancesReducer';
import authenticated from './loginReducer';
import ajaxStatus from './ajaxStatusReducer';
import logs from './logsReducer';
import viewType from './viewTypeReducer';

const rootReducer = combineReducers({
  instances,
  authenticated,
  ajaxStatus,
  logs,
  viewType,
});

export default rootReducer;