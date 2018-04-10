import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function viewTypeReducer(state = initialState.viewType, action) {
  switch (action.type){
    case types.CHANGE_LIST_TYPE:
      return {...state, listType: action.listType};
    case types.CHANGE_SHOWING_ITEMS:
      return {...state, showingItems: action.showingItems};
    default:
      return state
  }
}