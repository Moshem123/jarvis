/* eslint-disable import/no-duplicates */
import express from 'express';
import '../controllers/socket'; // For tail and db to work (socket-io)
import * as users from '../controllers/users';
import * as details from '../controllers/details';
import * as hosts from '../controllers/hosts';
import * as update from '../controllers/update';
import * as instances from '../controllers/instances';
import * as sms from '../controllers/sms';
import * as trepo from '../controllers/trepo';

const inst = express.Router();
const get = express.Router();
const tr = express.Router();
const api = express.Router();

api.post('/login', users.login);
api.get('/logout', users.verifyToken, users.logout);
api.get('/verify-token', users.verifyToken, users.isAuthenticated);
api.get('/ping', details.ping);
api.post('/send-sms', sms.sendSMS);


// API
api.use(users.verifyToken);
api.use(users.authorizedEnvironments);
api.get(['/host', '/host/:hostid'], hosts.getHost);
api.post('/host', users.checkIfSuper, hosts.createHost);
api.post(['/host/update', '/host/update/:hostid'], users.checkIfSuper, hosts.updateHost);
api.get(['/host/delete', '/host/delete/:hostid'], users.checkIfSuper, hosts.deleteHost);
api.get('/action', details.checkIfGroupAllowed, details.getDetails);
api.post('/update', details.checkIfGroupAllowed, update.updater);
api.post('/gettnetjar', details.checkIfGroupAllowed, update.getTnetJar);

// Instances
api.use('/instances/', inst);
inst.use(users.verifyToken);
inst.use(users.authorizedTypes);
inst.get('/spot', instances.getAllSpotInst);
inst.get('/spot/:groupid', instances.getSingleSpotInst);
inst.post('/spot', instances.toggleSpotInst);
inst.get('/ec2', instances.getAllEC2Inst);
inst.get('/ec2/:id', instances.getSingleEC2Inst);
inst.post('/ec2', instances.toggleEC2Inst);
inst.get('/fleet/', instances.getAllFleet);
inst.get('/fleet/:fleet', instances.getSingleFleet);
inst.post('/fleet', instances.toggleFleetInst);

// get routes
api.use('/get/', get);
get.use(users.verifyToken);
get.get('/details', details.getDetails);
get.get('/upgrade-scripts', details.getUpgradeScripts);
get.post('/root-logs', details.getLogDir);
get.post('/cat-log', details.catLog);
get.post('/grep-log', details.grepLog);

// tnet-repo routes
api.use('/trepo/', tr);
tr.post('*', trepo.proxyTR);

export {api};