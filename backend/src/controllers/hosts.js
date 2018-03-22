/* eslint-disable */
// const knex = require('knex')(require('../../knexfile'));
// import config from '../config';
import logger from 'winston';

export function createHost(req, res) {
    const {name, url, environment, instanceId, region} = req.body;
    const ddFrames = req.body.ddFrames;
    logger.info(`User ${req.data.fName} ${req.data.lName} created a host - ${url} - ${name}`);
    return knex('hosts')
        .insert({
            name,
            url,
            environment,
            instanceId,
            region
        })
        .returning('id')
        .then((response) => {
            let ddArr = [];
            for (let i = 0; i < ddFrames.length; i++) {
                let obj = {owner: response[0], value: ddFrames[i]};
                ddArr.push(obj);
            }
            return knex.batchInsert('ddFrames', ddArr)
                .then(() => {
                    return res.send({status: 'ok', message: `Host created!`});
                })
                .catch((error) => {
                    console.log(`error inserting dd frames: ${error}`);
                });
        });
}

export function getHost(req, res) {
    if (typeof req.params.hostid !== 'undefined') {
        return knex('hosts').select('hosts.*', knex.raw('GROUP_CONCAT(??.??) AS ??', ['ddFrames', 'value', 'ddFrames']))
            .leftJoin('ddFrames', 'hosts.id', 'ddFrames.owner')
            .groupBy('id')
            .where('hosts.id', req.params.hostid)
            .andWhere('hosts.environment', 'in', req.authEnvironments)
            .then((response) => {
                return res.send(response);
            });
    } else {
        return knex('hosts').select('hosts.*', knex.raw('GROUP_CONCAT(??.??) AS ??', ['ddFrames', 'value', 'ddFrames']))
            .leftJoin('ddFrames', 'hosts.id', 'ddFrames.owner')
            .groupBy('id')
            .where('hosts.environment', 'in', req.authEnvironments)
            .then((response) => {
                return res.send(response);
            });
    }
}

export function deleteHost(req, res) {
    if (typeof req.params.hostid !== 'undefined') {
        return knex('ddFrames')
            .where('owner', req.params.hostid)
            .del()
            .then(() => {
                return knex('hosts')
                    .where('id', req.params.hostid)
                    .del()
                    .then((response) => {
                        if (response) {
                            logger.warn(`User ${req.data.fName} ${req.data.lName} deleted a host - ${req.params.hostid}`);
                            return res.send({
                                status: 'ok',
                                message: `Host with ID: ${req.params.hostid} successfully deleted.`
                            });
                        }
                        return res.send({
                            status: 'notok',
                            message: `Host with ID: ${req.params.hostid} doesn't exist`
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        return res.send({status: 'notok', message: 'No host id provided'});
    }
}

export function updateHost(req, res) {
    if (typeof req.params.hostid !== 'undefined') {
        console.log(req.body);

        return knex('ddFrames')
            .select(knex.raw('GROUP_CONCAT(??.??) AS ??', ['ddFrames', 'id', 'ddFrames']))
            .where('owner', req.params.hostid)
            .then(e => {
                /* Handle Datadog Frames */

                let frameIDS = e[0].ddFrames.split(',');
                for (let i = 0; i < frameIDS.length; i++) {
                    knex('ddFrames')
                        .where('id', frameIDS[i])
                        .update('value', req.body.ddFrames[i]).then();
                }
            })
            .then(() => {
                delete req.body.ddFrames;
                return knex('hosts')
                    .where('id', req.params.hostid)
                    .update(req.body)
                    .then((response) => {
                        if (response) {
                            logger.info(`User ${req.data.fName} ${req.data.lName} updated a host - ${req.params.hostid}`);
                            return res.send({
                                status: 'ok',
                                message: `Host with ID: ${req.params.hostid} successfully updated.`
                            });
                        }
                        return res.send({
                            status: 'notok',
                            message: `Host with ID: ${req.params.hostid} doesn't exist`
                        });
                    });
            });
    } else {
        return res.send({status: 'notok', message: 'No host id provided'});
    }
}