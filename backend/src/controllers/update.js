import config from '../config';

const logger = require('winston');
const request = require('request');
const execFile = require('child_process').execFile;

// Helper function
function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return {[newKey]: obj[key]};
    });
    return Object.assign({}, ...keyValues);
}

// Named exports
export function updater(req, res) {
    const {serv} = req.body;
    logger.info(`User ${req.data.fName} ${req.data.lName} requested to update ${req.body.serv} on ${req.body.srv}`);

    let updateName = '';
    if (typeof config.update[serv] !== 'undefined') {
        updateName = config.update[serv];
    } else {
        updateName = `update${serv.charAt(0).toUpperCase()}${serv.slice(1)}`;
    } // set update name according to application

    let jobData = {};
    // Set the req.body according to jenkins expected data
    req.body['token'] = 'yahalimedved';
    req.body['delay'] = '0sec';
    req.body['ANSIBLE_PLAYBOOK'] = 'site.yml';
    req.body[`${serv.toUpperCase()}_HOST`] = req.body.srv;
    delete req.body.serv;
    delete req.body.func;
    delete req.body.srv;
    if (req.body.latestyn === 'true') {
        req.body.latestyn = 'YES';
        req.body.versiont = req.body.versiont.toUpperCase();
        delete req.body.jarname;
        let newKeys = {latestyn: 'LATEST_BINARY_NAME', versionn: 'VERSION_NAME', versiont: 'RELEASE_TYPE'};
        jobData = renameKeys(req.body, newKeys);
    } else {
        req.body.latestyn = 'NO';
        delete req.body.versionn;
        delete req.body.versiont;
        let newKeys = {latestyn: 'LATEST_BINARY_NAME', jarname: 'BINARY_NAME'};
        jobData = renameKeys(req.body, newKeys);
    }

    let jobURL = `jenkins.tradair.com:8080/job/${updateName}`;
    let curlStr = `http://${jobURL}/buildWithParameters`;
    // First request: start the build
    request(curlStr, {
        auth: {
            'user': 'remote',
            'pass': 'Panda230'
        },
        qs: jobData
    }, (err, response) => {
        if (err) throw err;

        let queueID = response.headers.location.split('/')[5];
        let queueURL = `http://jenkins.tradair.com:8080/queue/item/${queueID}/api/json`;
        // Second request: get the build id from the qeueue id.
        request(queueURL, (err, response) => {
            let buildID = JSON.parse(response.body).executable.number;
            console.log(`build ID is ${buildID}`);
            let consoleTextURL = `http://${jobURL}/${buildID}/consoleText`;
            /* Start looking for finished only after 5 seconds
               Then query the console text every second and check the text.
             */
            setTimeout(() => {
                let checkFinishFunc = function () {
                    // Third looped request: get the finish status of the build.
                    request(consoleTextURL, {
                        auth: {
                            'user': 'remote',
                            'pass': 'Panda230'
                        }
                    }, (err, response) => {
                        // Split into array and find the string
                        let indexFinish = response.body.indexOf('Finished:');
                        if (indexFinish !== -1) {
                            let finishStatus = response.body.slice(indexFinish + 10, indexFinish + 50);
                            console.log('status: ' + finishStatus);
                            return res.send({status: 'ok', message: `${finishStatus}`});
                        } else {
                            setTimeout(checkFinishFunc, 3000);
                        }
                    });
                };

                checkFinishFunc();
            }, 5000);
        });
    });
}

export function getTnetJar(req, res) {
    // In order to start a NODE update, we need the TNET tar name.
    let server = req.body.srv;
    let command = `tail -1 ${config.paths.tnetVersionHistory} | awk '{print $3}'`;
    execFile('ssh', ['root@' + server, command], {timeout: 5000}, (error, stdout, stderr) => {
        if (error) {
            console.error('stderr', error);
            return res.status(200).send({stdout: stderr, error: error});
        }
        return res.status(200).send({stdout: stdout.toString()});
    });
}