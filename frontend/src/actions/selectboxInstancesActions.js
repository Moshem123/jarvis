import * as actions from "./actionTypes";

export function saveSelectedInstances(instances) {
    return {type: actions.SAVE_SELECTED_INSTANCES, instances}
}