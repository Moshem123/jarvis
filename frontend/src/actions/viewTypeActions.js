import * as types from './actionTypes';

export function changeListType(typeName){
  return {type: types.CHANGE_LIST_TYPE, listType: typeName};
}

export function changeShowingItems(items){
  return {type: types.CHANGE_SHOWING_ITEMS, showingItems: items};
}