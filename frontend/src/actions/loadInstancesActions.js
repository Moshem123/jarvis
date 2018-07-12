import axios from 'axios';
import * as actions from './actionTypes';
import { ajaxCallError, beginAjaxCall } from "./ajaxStatusActions";
import { getToken } from "../localStorage";

const rearrange = {
  spot: (data) => {
    return data.map(instance => {
      let data = {};
      data.lifeCycle = 'spot';
      data.id = instance.id;
      data.instanceId = instance.id;
      data.name = instance.name;

      if (instance.status) {
        data.status = instance.status.status.toLowerCase();
        data.ip = instance.status.privateIp || '';
        data.instanceId = instance.status.instanceId || instance.id;
        data.amazonType = instance.status.instanceType || '';

      } else {
        data.instanceId = instance.id;
        data.ip = '';
        data.status = instance.capacity.target === 1 ? 'running' : 'stopped';
        data.amazonType = '';
      }

      data.statusColor = getStatusColor(data.status);
      const tagType = (instance.compute.launchSpecification.tags || []).find(e => e.tagKey === "Type");
      data.type = tagType ? tagType.tagValue : '';
      const tagClient = (instance.compute.launchSpecification.tags || []).find(e => e.tagKey === "Client");
      data.client = tagClient ? tagClient.tagValue : '';
      data.tags = instance.compute.launchSpecification.tags || [];
      data.zone = instance.compute.availabilityZones[0].name;
      data.timestamp = instance.timestamp;
      return data;
    });
  },
  ec2: (data) => {
    return data.map(inst => {
      let data = {};
      data.lifeCycle = 'ec2';
      data.id = inst.InstanceId;
      data.instanceId = inst.InstanceId;
      const tagName = inst.Tags.find(e => e.Key === "Name");
      data.name = tagName ? tagName.Value : '';
      data.ip = inst.PrivateIpAddress;
      data.status = inst.State.Name;
      data.statusColor = getStatusColor(inst.State.Name);
      const tagType = inst.Tags.find(e => e.Key === "Type");
      data.type = tagType ? tagType.Value : '';
      const tagClient = inst.Tags.find(e => e.Key === "Client");
      data.client = tagClient ? tagClient.Value : '';
      data.amazonType = inst.InstanceType;
      data.zone = inst.Placement.AvailabilityZone;
      data.timestamp = inst.timestamp;
      data.tags = inst.Tags || [];
      return data;
    });

  },
  fleet: (data) => {
    return data.map(inst => {
      let data = {};
      data.lifeCycle = 'fleet';
      const spotId = inst.Tags.find(e => e.Key === "aws:ec2spot:fleet-request-id");
      data.id = spotId ? spotId.Value : inst.InstanceId;
      data.instanceId = inst.InstanceId;
      const tagName = inst.Tags.find(e => e.Key === "Name");
      data.name = tagName ? tagName.Value : '';
      data.ip = inst.PrivateIpAddress;
      data.status = inst.State.Name;
      data.statusColor = getStatusColor(inst.State.Name);
      const tagType = inst.Tags.find(e => e.Key === "Type");
      data.type = tagType ? tagType.Value : '';
      const tagClient = inst.Tags.find(e => e.Key === "Client");
      data.client = tagClient ? tagClient.Value : '';
      data.amazonType = inst.InstanceType;
      data.zone = inst.Placement.AvailabilityZone;
      data.timestamp = inst.timestamp;
      data.tags = inst.Tags || [];
      return data;
    });
  }
};

function getStatusColor(status) {
  if (['stopped', 'paused'].indexOf(status) !== -1) {
    return 'red';
  } else if (['fulfilled', 'started', 'running', 'active'].indexOf(status) !== -1) {
    return 'green';
  } else {
    return 'orange';
  }
}

function reArrangeInstances(instances) {
  const spot = rearrange.spot(instances.spot);
  const ec2 = rearrange.ec2(instances.ec2);
  const fleet = rearrange.fleet(instances.fleet);

  // sort
  return ec2.concat(spot).concat(fleet);
  /*return spot.concat(ec2).sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });*/
}

export function loadInstancesSuccess(instances) {
  return { type: actions.LOAD_INSTANCES_SUCCESS, instances }
}

export function loadInstanceSuccess(instances) {
  return { type: actions.LOAD_INSTANCE_SUCCESS, instances }
}

export function loadInstances() {
  return function (dispatch) {
    return getToken().then(authConfig => {
      dispatch(beginAjaxCall());
      const spot = axios.get('/api/instances/spot', authConfig)
        .then(data => data.data);

      const ec2 = axios.get('/api/instances/ec2', authConfig)
        .then(data => data.data);

      const fleet = axios.get('/api/instances/fleet', authConfig)
        .then(data => data.data);

      return Promise.all([spot, ec2, fleet])
        .then(data => {
          const nData = reArrangeInstances({ spot: data[0], ec2: data[1], fleet: data[2] });
          dispatch(loadInstancesSuccess(nData));
        })
        .catch(err => {
          dispatch(ajaxCallError());
          if (err.response.status === 401) {
            return Promise.reject(err.response.data);
          }
        });
    }).catch(() => {
      dispatch({ type: actions.AUTHENTICATION_ERROR });
    });
  }
}

export function loadInstance(instanceData) {
  return function (dispatch) {
    return getToken().then(authConfig => {
      const isSpot = instanceData.lifeCycle === 'spot';
      if (!isSpot) {
        authConfig.params = { region: instanceData.zone.slice(0, -1) }
      }
      dispatch(beginAjaxCall());
      return axios.get(`/api/instances/${instanceData.lifeCycle}/${instanceData.instanceId}`, authConfig)
        .then(data => {
          const newData = rearrange[instanceData.lifeCycle](data.data);
          dispatch(loadInstanceSuccess(newData));
          return newData[0];
        })
        .catch(err => {
          dispatch(ajaxCallError());
          if (err.response.status === 401) {
            return Promise.reject(err.response.data);
          }
        });
    }).catch(() => {
      dispatch({ type: actions.AUTHENTICATION_ERROR });
    });
  }
}