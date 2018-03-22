const winston = require('winston');
const fs = require('fs');
const path = require('path');
let logDir = '/var/log/jarvis/';
const isWin = /^win/.test(process.platform);
const tsFormat = () => (new Date()).toLocaleString();

(isWin) && (logDir = path.normalize('C:\\\\tradair\\\\logs\\\\jarvis'));
// Create the log directory if it does not exist
if (!fs.existsSync(path.dirname(logDir))) fs.mkdirSync(path.dirname(logDir));
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

winston.remove(winston.transports.Console);     // remove the default options
winston.add(winston.transports.Console, {       // and substitute these
    timestamp: tsFormat,
    colorize: true
});
winston.add(winston.transports.File, {       // and file transport
    filename: `${logDir}/audit.log`,
    timestamp: tsFormat,
    level: 0
});