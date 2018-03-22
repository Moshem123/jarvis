import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function instancesReducer(state = initialState.instances, action) {
    switch (action.type){
        case types.LOAD_INSTANCES_SUCCESS:
            return {...state, instances: action.instances};
        case types.LOAD_INSTANCE_SUCCESS:
            return {...state, instances: [...state.instances.filter(e => e.id !== action.instances[0].id), action.instances[0]]};
        case types.SAVE_SELECTED_INSTANCES:
            return {...state, selectedInstances: action.instances};
        default:
            return state;
    }
}