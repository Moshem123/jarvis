import config from '../../config';
import logger from 'winston';
import AWS from 'aws-sdk';
import { cacheTime } from "./index";
import { performExec } from "../details";

// Configure aws sdk
const { accessKeyId, secretAccessKey } = config.aws;
let awsConfig = new AWS.Config({ region: config.aws.region });
awsConfig.credentials = { accessKeyId, secretAccessKey, };
AWS.config = awsConfig;
let ec2 = {}; // Object that holds aws-sdk-instance for each region.
ec2['default'] = new AWS.EC2(); // This is for describeRegions :)

let ec2Cache = {};
let fleetCache = {};

function awsApi(region, instanceId) {
    return new Promise((resolve, reject) => {
        if (!ec2.hasOwnProperty(region)) {
            AWS.config.update({ region });
            ec2[region] = new AWS.EC2();
        }
        let describeObj = instanceId ? { InstanceIds: [instanceId] } : {};
        ec2[region].describeInstances(describeObj, (err, data) => {
            if (err) return reject(err);// an error occurred
            let instances = data['Reservations'].reduce((acc, resObj) => acc.concat(resObj.Instances),[]);
            instances.forEach(e => e.timestamp = new Date().getTime());
            resolve(instances);
        });
    });
}

function getRegions() {
    return new Promise((resolve, reject) => {
        const regions = ["eu-west-2", "eu-west-1", "ap-southeast-1", "us-east-1"];
        let instances = [];
        let promiseArr = [];
        regions.forEach(region => {
            const getInstances = awsApi(region)
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
        let obj = { InstanceIds: [instanceId] };
        let status, status2;
        if (statusCode === '1') {
            status = status2 = 'start';
        } else {
            status = 'stop';
            status2 = 'stopp';
        }

        if (!ec2.hasOwnProperty(region)) {
            AWS.config.update({ region });
            ec2[region] = new AWS.EC2();
        }

        ec2[region].describeTags({ Filters: [{ Name: 'resource-id', Values: [instanceId] }] }, (err, data) => {
            if (err) return reject([status, err]); // an error occurred

            if (authTypes.indexOf('all') > -1 || checkTagsInComparisonToConfig(data.Tags, authTypes)) {
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
    if (authTypes.indexOf('all') > -1) {
        returnArr = instances;
    }
    else {
        returnArr = instances.filter((instance) => {
            const tags = instance.Tags;
            return checkTagsInComparisonToConfig(tags, authTypes);
        });
    }
    return returnArr;
}

function filterEC2(instances) {
    return instances.filter(e => e.InstanceLifecycle !== "spot" && !e.Tags.find(e => e.Key === "spotinst:aws:ec2:group:id"));
}

function filterFleet(instances) {
    return instances.filter(instance => instance.Tags.find(e => e.Key === "aws:ec2spot:fleet-request-id"))
}

function checkTagsInComparisonToConfig(tags, authTypes) {
    const clientIndex = tags.findIndex(e => e.Key === "Client");
    const typeIndex = tags.findIndex(e => e.Key === "Type");
    if (typeof tags[clientIndex] === 'undefined' && typeof tags[typeIndex] === 'undefined') {
        return true;
    }
    return (authTypes.indexOf((tags[clientIndex] || {}).Value) > -1) ||
        (authTypes.indexOf((tags[typeIndex] || {}).Value) > -1)
}

/*function getFleetInstances(fleetId) {
    return new Promise((resolve, reject) => {
        let describeObj = { SpotFleetRequestId: fleetId };
        ec2['default'].describeSpotFleetInstances(describeObj, (err, data) => {
            if (err) return reject(err);// an error occurred
            resolve(data);
        });
    });
}

function getFleet(fleetId) {
    return getRegions(fleetId)
        .then(data => {
                fleetCache.timestamp = new Date().getTime(); // Fill the cache time
                const promises = data.SpotFleetRequestConfigs.map(request => {
                    return getFleetInstances(request.SpotFleetRequestId)
                        .then(instances => {
                            if (instances.ActiveInstances !== undefined && instances.ActiveInstances.length !== 0) {
                                const ec2Promises = instances.ActiveInstances.map(instance => {
                                    return awsApi('default', instance.InstanceId).then(inst => inst[0]);
                                });
                                return Promise.all(ec2Promises)
                                    .then(instancesData => {
                                        request.instances = instancesData;
                                        return request;
                                    })
                            } else {
                                request.instances = [];
                                return request;

                            }
                        });
                });
                return Promise.all(promises)
                    .then(promises => promises);
            },
            err => Promise.reject(err)
        );
}
*/
function toggleFleet(id, statusCode, region, ip) {
    let status, status2;
    if (statusCode === 1) {
        status = status2 = 'start';
    } else {
        status = 'stop';
        status2 = 'stopp';
    }
    if (!ec2.hasOwnProperty(region)) {
        AWS.config.update({ region });
        ec2[region] = new AWS.EC2();
    }
    return new Promise((resolve, reject) => {
        const describeObj = {
            SpotFleetRequestId: id,
            TargetCapacity: statusCode
        };
        return ec2[region].modifySpotFleetRequest(describeObj, (err, data) => {
            if (err) return reject([status, err]); // an error occurred
            console.log(data);
            // If we want to stop, we need to send shutdown command to the server via ssh
            if (statusCode === 0) {
                // if (!fleetCache.body){
                //
                // }
                const command = `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${ip} "sudo shutdown now"`;
                performExec(command)
                    .then(data => {
                        console.log(data);
                        resolve(status2);
                    });
            } else {
                resolve(status2);
            }
        });
    });
}


// ===================================================

export const getAllEC2Inst = (req, res) => {
    /* If the cache was never set
    /* or if check if 10 minutes passed since last ec2 machine retrieval */
    if (!ec2Cache.timestamp || (new Date().getTime() - ec2Cache.timestamp) > cacheTime) {
        return getRegions()
            .then(data => {
                ec2Cache.timestamp = new Date().getTime(); // Fill the cache time
                ec2Cache.body = filterEC2(data);
                return res.send(filterEC2Types(req.authTypes, ec2Cache.body));
            }, err => res.status(400).send({ status: 'notok', message: err }));
    } else {
        // If 10 minutes HASN'T passed, send the same data.
        return res.send(filterEC2Types(req.authTypes, ec2Cache.body));
    }
};

export const getAllFleetInst = (req, res) => {
    /* If the cache was never set
    /* or if check if 10 minutes passed since last ec2 machine retrieval */
    if (!fleetCache.timestamp || (new Date().getTime() - fleetCache.timestamp) > cacheTime) {
        return getRegions()
            .then(data => {
                fleetCache.timestamp = new Date().getTime(); // Fill the cache time
                fleetCache.body = filterFleet(data);
                return res.send(fleetCache.body);
            }, err => res.status(400).send({ status: 'notok', message: err }));
    } else {
        // If 10 minutes HASN'T passed, send the same data.
        return res.send(fleetCache.body);
    }
};

export const getSingleEC2Inst = (req, res) => {
    return awsApi(req.query.region, req.params.id)
        .then(data => {
            if (ec2Cache.body) {
                let newObj = ec2Cache.body.filter(el => el.InstanceId !== data[0].InstanceId);
                ec2Cache.body = newObj.concat(data);
            }
            return res.status(200).send(filterEC2Types(req.authTypes, data));
        })
        .catch(err => res.status(400).send({ status: 'notok', message: err }));
};

export const getSingleFleetInst = (req, res) => {
    return awsApi(req.query.region, req.params.id)
        .then(data => {
            if (fleetCache.body) {
                let newObj;
                newObj = fleetCache.body = fleetCache.body.filter(el => el.InstanceId !== data[0].InstanceId);
                fleetCache.body = newObj.concat(data);
            }
            return res.status(200).send(data);
        })
        .catch(err => res.status(400).send({ status: 'notok', message: err }));
};

export const toggleEC2Inst = (req, res) => {
    if (!req.body.hasOwnProperty('id')) {
        return res.status(400).send({ status: 'notok', message: `No Instance ID specified` })
    }
    const { id, status, region } = req.body;
    return toggleEC2(id, status, region, req.authTypes)
        .then(status => {
            logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed EC2 instance id: ${id}`);
            return res.send({ status: 'ok', message: `Server successfully ${status}ed` });
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
            return res.status(400).send({ status: 'notok', message: `Server wasn't ${status}ed: ${msg}` })
        })
        .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
};

/*
export const getAllFleet = (req, res) => {
    /!* If the cache was never set
    /!* or if check if 10 minutes passed since last ec2 machine retrieval *!/
    if (!fleetCache.timestamp || (new Date().getTime() - fleetCache.timestamp) > cacheTime) {
        return getRegions('fleet')
            .then(data => {
                fleetCache.timestamp = new Date().getTime(); // Fill the cache time
                fleetCache.body = data;
                return res.send(fleetCache.body);
            }, err => res.status(400).send({ status: 'notok', message: err }));
    } else {
// If 10 minutes HASN'T passed, send the same data.
        return res.send(fleetCache.body);
    }
};

export const getSingleFleet = (req, res) => {
    return getFleet(req.params.fleet)
        .then(data => {
            if (fleetCache.body) {
                let newObj;
                newObj = fleetCache.body = fleetCache.body.filter(el => el.SpotFleetRequestId !== data[0].SpotFleetRequestId);
                fleetCache.body = newObj.concat(data);
            }
            return res.send(data);
        })
        .catch(err => res.status(400).send({ status: 'notok', message: err }));
};*/

export const toggleFleetInst = (req, res) => {
    if (!req.body.hasOwnProperty('id')) {
        return res.status(400).send({ status: 'notok', message: `No Fleet ID specified` })
    }
    const { id, status, region, ip } = req.body;

    return toggleFleet(id, status, region, ip)
        .then(status => {
            logger.info(`User ${req.data.fName} ${req.data.lName} just ${status}ed Fleet instance id: ${id}`);
            return res.send({ status: 'ok', message: `Server successfully ${status}ed` });
        }, err => {
            const status = err[0];
            const msg = err[1];
            return res.status(400).send({ status: 'notok', message: `Server wasn't ${status}ed: ${msg}` })
        })
        .catch(err => console.log(`wrongfully handled promise rejection: ${err}`));
};