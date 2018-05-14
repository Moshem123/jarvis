import request from 'request-promise-native';
import config from '../../config';
import { cacheTime } from "./index";
import logger from "winston/lib/winston";

const app = require('../../index').app;

// Configure spot
const spotURL = 'https://api.spotinst.io/aws/ec2';
let spotCache = {};

function getSpotAuth() {
  return { auth: { 'bearer': app.get('spotinst') } };
}

function checkIfSpotIsStateful(groupid) {
  const spotAuth = getSpotAuth();

  return request(`${spotURL}/group/${groupid}/statefulInstance?accountId=${config.spotinst.accountId}`, spotAuth)
    .then(data => {
      const e = JSON.parse(data);
      return (e.response.items === undefined || e.response.items.length === 0)
        ? null
        : e.response.items[0];
    });
}

// Send request for spot instance(s) and return a promise
function requestSpotGroup(groupId = '') {
  const spotAuth = getSpotAuth();
  return request(`${spotURL}/group/${groupId}`, spotAuth)
    .then(data => {
      let { items } = JSON.parse(data).response;
      const promiseArr = items.map((instance, i) => { // Get status for each instance, insert the request object to an array, for Promise.all
        return request(`${spotURL}/group/${instance.id}/status`, spotAuth)
          .then(response => {
            const parsed = JSON.parse(response).response.items;
            if (parsed.length > 0) {
              items[i].status = parsed[0];
              items[i].timestamp = new Date().getTime();
            } else {
              return checkIfSpotIsStateful(instance.id)
                .then(e => {
                  if (e) {
                    items[i].status = { status: e.state };
                    items[i].timestamp = new Date().getTime();
                  }
                });
            }

          })
          .catch(err => console.log(err));
      });
// Resolve all instance status requests
      return Promise.all(promiseArr)
        .then(() => items)
        .catch(err => console.log(err));
    })
    .catch(err => {
      const parsedErr = JSON.parse(err.response.body);
      const c1 = ((parsedErr || {}).response || {}).errors.map(error => error.message);
      const c2 = (((parsedErr || {}).response || {}).status || {}).message;
      let errorData = c1.join(', ') || c2 || 'Unknown error.';
      return Promise.reject(errorData);
    });
}

function filterSpotTypes(authTypes, instances) {
  let returnArr = [];
  if (authTypes.indexOf('all') > -1)
    returnArr = instances;
  else
    returnArr = instances.filter(instance => { // Filter only authorized instances
      let clientIndex = instance.compute.launchSpecification.tags.findIndex(e => e.tagKey === "Client");
      if (typeof instance.compute.launchSpecification.tags[clientIndex] === 'undefined') return true; // return
      // even if
      // it
      // doesn't
      // have
      // client
      // tag
      return authTypes.indexOf(instance.compute.launchSpecification.tags[clientIndex].tagValue) > -1; // return
      // instances
      // that
      // their
      // client
      // tag is
      // in the
      // authorized
      // types
      // array
    });
  return returnArr; // Send the instances the user is authorized to see
}

function toggleSpot(groupId, statusCode, instance) {
  const spotAuth = getSpotAuth();

  let action, status, url;
  if (statusCode === '1') {
    action = 'resume';
    status = 'start';
  } else {
    action = 'pause';
    status = 'stopp';
  }
  if (instance) { // Stateful
    url = `${spotURL}/group/${groupId}/statefulInstance/${instance}/${action}?accountId=${config.spotinst.accountId}`;
  } else { // Stateless
    url = `${spotURL}/group/${groupId}`;
    spotAuth.body = {
      "group": {
        "capacity": {
          "target": statusCode,
          "minimum": statusCode,
          "maximum": statusCode
        }
      }
    };
    spotAuth.json = true;
  }

  return request.put(url, spotAuth)
    .then(() => status)
    .catch(err => {
      const parsedErr = JSON.parse(err.response.body);
      const c1 = ((parsedErr || {}).response || {}).errors.map(error => error.message);
      const c2 = (((parsedErr || {}).response || {}).status || {}).message;
      let errorData = c1.join(', ') || c2 || 'Unknown error.';
      return Promise.reject([status, errorData]);
    });
}

// ===================================================

export const getAllSpotInst = (req, res) => {
  /* If the cache was never set
  /* or if check if 10 minutes passed since last ec2 machine retrieval */
  if (!spotCache.timestamp || (new Date().getTime() - spotCache.timestamp) > cacheTime) {
    requestSpotGroup()
      .then(data => {
          spotCache.timestamp = new Date().getTime(); // Fill the cache time
          spotCache.body = data;
          return res.send(filterSpotTypes(req.authTypes, spotCache.body));
        },
        err => res.status(400).send({ status: 'notok', message: err })
      );
  } else {
// If 10 minutes HASN'T passed, send the same data.
    return res.send(filterSpotTypes(req.authTypes, spotCache.body));
  }
};

export const getSingleSpotInst = (req, res) => {
  requestSpotGroup(req.params.groupid)
    .then(data => {
      if (spotCache.body)
        spotCache.body = spotCache.body.filter(el => el.id !== data[0].id);
      return res.status(200).send(filterSpotTypes(req.authTypes, data));
    }, err => res.status(400).send({ status: 'notok', message: err }));
};

export const toggleSpotInst = (req, res) => {
  /*    const spotAuth = getSpotAuth();
  request(`${spotURL}/group/${req.body.groupid}/statefulInstance?accountId=${config.spotinst.accountId}`, spotAuth)
  .then(data => {
  const e = JSON.parse(data);
  const instance = (e.response.items === undefined || e.response.items.length === 0)
  ? null
  : e.response.items[0].id;

  toggleSpot(req.body.groupid, req.body.status, instance)
  .then(status => {
  logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed spot instance group: ${req.body.groupid}`);
  return res.send({status: 'ok', message: `Server successfully ${status}ed`});
  }, err => res.status(400).send({status: 'notok', message: `Server wasn't ${err[0]}ed: ${err[1]}`}))
  .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
  })
  .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));*/
  if (!req.body.hasOwnProperty('id')) {
    return res.status(400).send({ status: 'notok', message: `No Group ID specified` })
  }
  const { id, status } = req.body;
  checkIfSpotIsStateful(id)
    .then(instance => {
      toggleSpot(id, status, instance.id)
        .then(status => {
            logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed spot instance group: ${req.body.groupid}`);
            return res.send({ status: 'ok', message: `Server successfully ${status}ed` });
          },
          err => res.status(400).send({ status: 'notok', message: `Server wasn't ${err[0]}ed: ${err[1]}` }))
        .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
    })
    .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
};
