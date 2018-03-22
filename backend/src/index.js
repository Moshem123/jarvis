import express from 'express';
import morgan from 'morgan';
import winston from 'winston';
import './controllers/log';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
// import path from 'path';

// IO stuff and app
const app = module.exports.app = express();
const server = require('http').Server(app);
module.exports.io = require('socket.io')(server);

const route = require('./routes/index');
import config from './config';
const port = config.port;

// secret variable
app.set('superSecret', config.secret);
app.set('spotinst', config.spotinst.secret);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use(morgan('dev'));

app.use('/', route.api);
// route.api.use('/instances/', route.inst);

server.listen(port, e => {
    if (e) throw(e);
    winston.info('App running on localhost:' + port);
});