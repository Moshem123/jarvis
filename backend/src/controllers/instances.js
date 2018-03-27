/* eslint-disable */
import config from '../config';

const app = require('../index').app;
import logger from 'winston';
import request from 'request-promise-native';
import AWS from 'aws-sdk';

// Configure aws sdk
const {accessKeyId, secretAccessKey} = config.aws;
let awsConfig = new AWS.Config({region: config.aws.region});
awsConfig.credentials = {accessKeyId, secretAccessKey,};
AWS.config = awsConfig;
let ec2 = {}; // Object that holds aws-sdk instance for each region.
ec2['default'] = new AWS.EC2(); // This is for describeRegions :)


// Configure spot
const spotURL = 'https://api.spotinst.io/aws/ec2';

const cacheTime = 60;
let ec2Cache = {};
let spotCache = {};

/* Helper functions */
function getSpotAuth() {
    return {auth: {'bearer': app.get('spotinst')}};
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
            let {items} = JSON.parse(data).response;
            let promiseArr = [];
            items.forEach((instance, i) => { // Get status for each instance, insert the request object to an array, for Promise.all
                const getStatus = request(`${spotURL}/group/${instance.id}/status`, spotAuth)
                    .then(response => {
                        const parsed = JSON.parse(response).response.items;
                        if (parsed.length > 0) {
                            items[i].status = parsed[0];
                            items[i].timestamp = new Date().getTime();
                        } else {
                            return checkIfSpotIsStateful(instance.id)
                                .then(e => {
                                    items[i].status = {status: e.state};
                                    items[i].timestamp = new Date().getTime();
                                });
                        }

                    })
                    .catch(err => console.log(err));
                promiseArr.push(getStatus);
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
            if (typeof instance.compute.launchSpecification.tags[clientIndex] === 'undefined') return true; // return even if it doesn't have client tag
            return authTypes.indexOf(instance.compute.launchSpecification.tags[clientIndex].tagValue) > -1; // return instances that their client tag is in the authorized types array
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

function getEC2(region, instanceId) {
    return new Promise((resolve, reject) => {
        if (!ec2.hasOwnProperty(region)) {
            AWS.config.update({region});
            ec2[region] = new AWS.EC2();
        }
        let describeObj = instanceId ? {InstanceIds: [instanceId]} : {};

        ec2[region].describeInstances(describeObj, (err, data) => {
            if (err) return reject(err);// an error occurred
            data.Reservations.forEach(e => e.Instances[0].timestamp = new Date().getTime());
            resolve(data.Reservations);
        });
    });
}

/*function getRegions() {
    return new Promise((resolve, reject) => {
        return ec2.default.describeRegions({}, (err, data) => {
            if (err) return reject(err); // an error occurred
            const badRegions = ['ap-south-1', 'ap-northeast-2', 'ap-northeast-1', 'sa-east-1', 'ca-central-1', 'ap-southeast-2', 'eu-central-1', 'us-east-2', 'us-west-1', 'us-west-2'];
            let instances = [];
            let promiseArr = [];
            data.Regions.forEach((region) => {
                if (badRegions.indexOf(region.RegionName) > -1) return;
                console.log(region.RegionName);
                const getInstances = getEC2(region.RegionName)
                    .then(data => {
                        instances = instances.concat(data);
                    })
                    .catch(err => console.log(err));
                promiseArr.push(getInstances);
            });
            // Resolve all instance status requests
            return Promise.all(promiseArr)
                .then(() => {
                    return resolve(instances);
                })
                .catch(err => console.log(err));
        });
    });
}*/

function getRegions() {
    return new Promise((resolve, reject) => {
        const regions = ["eu-west-3", "eu-west-2", "eu-west-1", "ap-southeast-1", "us-east-1"];
        let instances = [];
        let promiseArr = [];
        regions.forEach(region => {
            const getInstances = getEC2(region)
                .then(data => {
                    instances = instances.concat(data);
                })
                .catch(err => reject(err));
            promiseArr.push(getInstances);
        });
        // Resolve all instance status requests
        return Promise.all(promiseArr)
            .then(() => {
                return resolve(instances);
            })
            .catch(err => console.log(err));
    });
}

function toggleEC2(instanceId, statusCode, region, authTypes) {
    return new Promise((resolve, reject) => {
        let obj = {InstanceIds: [instanceId]};
        let status, status2;
        if (statusCode === '1') {
            status = status2 = 'start';
        } else {
            status = 'stop';
            status2 = 'stopp';
        }

        if (!ec2.hasOwnProperty(region)) {
            AWS.config.update({region});
            ec2[region] = new AWS.EC2();
        }

        ec2[region].describeTags({Filters: [{Name: 'resource-id', Values: [instanceId]}]}, (err, data) => {
            if (err) return reject([status, err]); // an error occurred

            let client;
            if (data) {
                client = data.Tags.find((e) => e.Key === "Client").Value;
            }
            if (authTypes.indexOf('all') > -1 || authTypes.indexOf(client) > -1) {
                ec2[region][`${status}Instances`](obj, (err) => {
                    if (err) return reject([status, err]); // an error occurred

                    resolve(status2);
                });
            } else {
                return reject(status)
            }
        });
    });
}

function filterEC2Types(authTypes, instances) {
    let returnArr = [];
    if (authTypes.indexOf('all') > -1)
        returnArr = instances;
    else
        returnArr = instances.filter((instance) => {
            let clientIndex = instance.Instances[0].Tags.findIndex(e => e.Key === "Client");
            if (typeof instance.Instances[0].Tags[clientIndex] === 'undefined') return true;
            return authTypes.indexOf(instance.Instances[0].Tags[clientIndex].Value) > -1;
        });
    return returnArr;
}

// ===================================================

/* Named exports */
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
                err => res.status(400).send({status: 'notok', message: err})
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
        }, err => res.status(400).send({status: 'notok', message: err}));
};

export const getAllEC2Inst = (req, res) => {
    /* If the cache was never set
    /* or if check if 10 minutes passed since last ec2 machine retrieval */
    if (!ec2Cache.timestamp || (new Date().getTime() - ec2Cache.timestamp) > cacheTime) {
        getRegions()
            .then(data => {
                ec2Cache.timestamp = new Date().getTime(); // Fill the cache time
                ec2Cache.body = data;
                return res.send(filterEC2Types(req.authTypes, ec2Cache.body));
            }, err => res.status(400).send({status: 'notok', message: err}));
    } else {
        // If 10 minutes HASN'T passed, send the same data.
        return res.send(filterEC2Types(req.authTypes, ec2Cache.body));
    }
};

export const getSingleEC2Inst = (req, res) => {
    getEC2(req.query.region, req.params.id)
        .then(data => {
            if (ec2Cache.body) {
                let newObj;
                newObj = ec2Cache.body = ec2Cache.body.filter(el => el.Instances[0].InstanceId !== data[0].Instances[0].InstanceId);
                ec2Cache.body = newObj.concat(data);
            }
            return res.status(200).send(filterEC2Types(req.authTypes, data));
        })
        .catch(err => res.status(400).send({status: 'notok', message: err}));
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

    checkIfSpotIsStateful(req.body.groupid)
        .then(instance => {
            toggleSpot(req.body.groupid, req.body.status, instance.id)
                .then(status => {
                    logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed spot instance group: ${req.body.groupid}`);
                    return res.send({status: 'ok', message: `Server successfully ${status}ed`});
                }, err => res.status(400).send({status: 'notok', message: `Server wasn't ${err[0]}ed: ${err[1]}`}))
                .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
        })
        .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
};

export const toggleEC2Inst = (req, res) => {
    const {instanceid, status, region} = req.body;
    toggleEC2(instanceid, status, region, req.authTypes)
        .then(status => {
            logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed EC2 instance id: ${req.body.instanceid}`);
            return res.send({status: 'ok', message: `Server successfully ${status}ed`});
        }, err => {
            let msg, status;
            if (typeof err === 'string') {
                status = err;
                msg = 'You are not authorized, this incident will be reported.';
                logger.warn(`User ${req.data.fName} ${req.data.lName} tried ${status}ing EC2 instance id: ${req.body.instanceid} - NOT AUTHORIZED!`);
            } else {
                status = err[0];
                msg = err[1];
            }
            return res.status(400).send({status: 'notok', message: `Server wasn't ${status}ed: ${msg}`})
        })
        .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));


};