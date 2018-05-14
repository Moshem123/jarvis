/* eslint-disable */
import { exec, execFile } from 'child_process';
import logger from 'winston';
import pinger from 'ping';
import config from '../config';

// const knex = require('knex')(require('../../knexfile'));

function handleExecData(error, stdout, stderr) {
  let errors = [];
  let statusCode = 200;
  let statusText = 'ok';
  let message;
  if (error) { // && !stdout
    console.error('error', error);
    errors.push(error);
    if (!stdout) {
      statusCode = 400;
      statusText = "notok";
    }
  }
  if (stderr) {
    console.error("stderr", stderr);
    errors.push(stderr);
    if (!stdout) {
      statusText = "notok";
      statusCode = 400;
    }
  }

  message = stdout ? stdout.toString().trim() : errors.join(', ');
  return { message, statusText, statusCode };
}

export function performExec(command, extraOptions = {}) {
  return new Promise((resolve) => {
    return exec(command, extraOptions, (error, stdout, stderr) => {
      const resData = handleExecData(error, stdout, stderr);
      return resolve(resData);
    });
  });
}

export function checkIfGroupAllowed(req, res, next) {
  let qry = '';
  if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
    qry = req.body;
  } else {
    qry = req.query;
  }

  knex('hosts').select('id')
    .where('url', qry.srv)
    .andWhere('environment', 'in', req.authEnvironments)
    .then(e => {
      if (typeof e[0] !== 'undefined') {
        req.qry = qry;
        next();
      } else {
        logger.warn(`User ${req.data.fName} ${req.data.lName} tried to execute ${qry.script} ${qry.func} ${qry.serv} on ${qry.srv} - Not Authorized!`);
        return res.send({
          status: 'notok',
          message: `not authorized`
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

export function getDetails(req, res) {
  /* if a user accesses /get/details, there are no security checks at all.
  *  if a user accesses /api/action:
  *  1: Check if the token is authorized (Users.verifyToken)
  *  2: Get his authorized environments and pass them on (Users.authorizedEnvironments)
  *  3: Check if the server he asked to perform an action on is in one of the environments he has access to (Details.checkIfGroupAllowed)
  */

  let qry = req.qry || (Object.keys(req.query).length === 0 && req.query.constructor === Object)
    ? req.body
    : req.query;
  if (Object.keys(qry).length !== 0) {
    if (qry.func !== "all" && qry.script !== "tail") {
      logger.info(`User ${req.data.fName} ${req.data.lName} executed ${qry.script} ${qry.func} ${qry.serv} on ${qry.srv}`);
    }
    execFile('ssh', ['root@' + qry.srv, qry.script, qry.func, qry.serv], { timeout: 5000 }, (error, stdout, stderr) => {
      let stderrObj = {};
      if (error) {
        console.error('stderr', error);
        stderrObj = { stderr: stderr, error: error };
      }
      let stdoutObj = { stdout: stdout.toString() };
      const sendObj = Object.assign({}, stderrObj, stdoutObj);
      return res.status(200).send(sendObj);

    });
  } else {
    return res.send({
      status: 'notok',
      message: `no parameters provided`
    });
  }
}

export function getUpgradeScripts(req, res) {
  let qry = req.qry || (Object.keys(req.query).length === 0 && req.query.constructor === Object)
    ? req.body
    : req.query;
  const findCommand = `ssh root@${qry.srv} "find ${config.paths.upgradeScripts}/ -type f -name '*sql' | sed 's?${config.paths.upgradeScripts}/??' | sort"`;
  performExec(findCommand, { timeout: 5000 })
    .then(resData => res.status(resData.statusCode).send({ status: resData.statusText, message: resData.message }));
  /*exec(findCommand, {timeout: 5000}, (error, stdout, stderr) => {
    const resData = handleExecData(error, stdout, stderr);
    return res.status(resData.statusCode).send({status: resData.statusText, message: resData.message});
  });*/
}

export function getLogDir(req, res) {
  let qry = req.qry || (Object.keys(req.query).length === 0 && req.query.constructor === Object)
    ? req.body
    : req.query;

  let path = qry.path || config.paths.logs;
  /* first show directories under the path, then list files, print in a format of 'year/month/day hour:minute<tab>file size<tab>file name' and sort by the date.
  /* escaping in the printf is necessary!! */
  const findCommand = `ssh root@${qry.srv} "find ${path} -maxdepth 1 -type d;find ${path} -maxdepth 1 -type f -printf '%TY/%Tm/%Td %TH:%TM\\t%kKB\\t%P\\n' | sort -nr -k1.1,1.4 -k1.4,1.5 -k1.6 -k2.1,2.2 -k2.3,2.4"`;
  performExec(findCommand, { timeout: 5000 })
    .then(resData => res.status(resData.statusCode).send({ status: resData.statusText, message: resData.message }));
}

export function catLog(req, res) {
  let qry = req.qry || (
    (Object.keys(req.query).length === 0 && req.query.constructor === Object)
      ? req.body
      : req.query
  );
  const maxLines = 700;
  if (qry.page) { // If a user requested a specific page
    const startPage = (qry.page === 1) ? 1 : qry.page * maxLines; // If page 1, start from 1, else, page * maxlines
    const sedQuery = `ssh root@${qry.srv} "sed -n '${startPage},${startPage + maxLines}p' ${qry.log}"`;
    performExec(sedQuery, { maxBuffer: 1024 * 250000 })
      .then(resData => res.status(resData.statusCode).send({
        status: resData.statusText,
        message: resData.message
      }));
  } else { // If a user first requested the log, with no page specified
    const countFileLines = `ssh root@${qry.srv} "wc -l ${qry.log}"`;
    performExec(countFileLines)
      .then(resData => {
        if (resData.statusCode !== 200) {
          return res.status(resData.statusCode).send({ status: resData.statusText, message: resData.message })
        }
        console.log(resData.message);
        const totalPages = Math.floor(resData.message.split(' ')[0] / maxLines); // Get page count by dividing
        // with maxlines
        const endLine = (totalPages >= 2.00) ? maxLines : resData.message.split(' ')[0]; // Get the bottom
        // line, if more than
        // 1 page, give only
        // maxlines, else give
        // all lines.
        const showSpecificLines = `ssh root@${qry.srv} "sed -n '1,${endLine}p' ${qry.log}"`;

        performExec(showSpecificLines, { maxBuffer: 1024 * 250000 })
          .then(data => res.status(data.statusCode).send({
            status: data.statusText,
            message: data.message,
            pages: totalPages
          }));
      });
  }
}

export function grepLog(req, res) {
  let qry = req.qry || (
    (Object.keys(req.query).length === 0 && req.query.constructor === Object)
      ? req.body
      : req.query
  );

  const grepQuery = `ssh root@${qry.srv} "grep '${qry.searchQuery}' ${qry.log} || echo 'No results found.'"`;
  performExec(grepQuery, {})
    .then(resData => res.status(resData.statusCode).send({
      status: resData.statusText,
      message: resData.message
    }));
}

export function ping(req, res) {
  const srv = req.query.srv;
  pinger.sys.probe(srv, (isAlive) => {
    let msg = isAlive ? 'host ' + srv + ' is alive' : 'host ' + srv + ' is down';
    let status = isAlive ? 'ok' : 'notok';
    console.log(msg);
    return res.send({ status: status, message: msg });
  });
}