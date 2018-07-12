/* eslint-disable */
const {spawn, exec} = require('child_process');
const psTree = require('ps-tree');
const io = require('../index').io;
import config from '../config';
const {verification} = require('./users');
let tails = {};

let kill = function (pid, signal, callback) {
    signal = signal || 'SIGKILL';
    callback = callback || function () {
    };
    let killTree = true;
    if (killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try {
                    process.kill(tpid, signal)
                }
                catch (ex) {
                }
            });
            callback();
        });
    } else {
        try {
            process.kill(pid, signal)
        }
        catch (ex) {
        }
        callback();
    }
};

function deleteTail(server, service) {
    if (typeof tails[server][service].tail !== "undefined") {
        let pid = tails[server][service].tail.pid;
        let isWin = /^win/.test(process.platform);
        if (!isWin) {
            kill(pid);
        } else {
            exec('taskkill /PID ' + pid + ' /T /F', function (error) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        }
    }
}

io.on('connection', socket => {
    let data;
    let token = decodeURIComponent(socket.handshake.headers.cookie).split('; ').filter(e => (e.indexOf('boAuth') > -1));
    if(token.length > 0) {
        token = token[0].slice(7);
        // Get boAuth token and verify it
        verification(token, e => {
            data = e;
        });
    }
    socket.on('db', qry => {
        const db = spawn('ssh', ['root@' + qry.srv, config.paths.db], {shell: true});
        db.stdout.on('data', data => {
            socket.emit('db', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
        });
        db.stderr.on('data', data => {
            socket.emit('db', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
        });
        db.on('close', code => {
            console.log(`child process exited with code ${code}`);
            socket.emit('db', {message: `DB finished. code ${code}`, srv: qry.srv});
        });
    });
    socket.on('db++', qry => {
        if (data) {
            const db = spawn('ssh', ['root@' + qry.srv, config.paths.dbpp], {shell: true});
            db.stdout.on('data', data => {
                socket.emit('db++', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
            });
            db.stderr.on('data', data => {
                socket.emit('db++', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
            });
            db.on('close', code => {
                console.log(`child process exited with code ${code}`);
                socket.emit('db++', {message: `DB++ finished. code ${code}`, srv: qry.srv});
            });
        } else {
            socket.emit('db++', {message: 'Not Authenticated, please log in.', srv: qry.srv});
        }
    });

    socket.on('upgrade-scripts', qry => {
        if (data) {
            exec(`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${qry.srv} "cut -d= -f2 ${config.paths.schemaFile}"`, {timeout: 5000}, (error, stdout) => {
                if (error) {
                    console.error('stderr', error);
                    socket.emit('upgrade-scripts', {message: 'No tnet-schema.info file, cannot determine DB schema.', srv: qry.srv});
                } else {
                    const schemaName = stdout.toString('utf8').replace(/\n/gm, '').trim();
                    const query = ['mysql', '-uroot', '-pPanda230', '-htnetdb', '-f', schemaName, '<', `${config.paths.upgradeScripts}/${qry.script}`];
                    console.log(`ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@${qry.srv}`, ...query);
                    const us = spawn('ssh', [`root@${qry.srv}`, ...query]);
                    us.stdout.on('data', data => {
                        console.log(data.toString());
                        socket.emit('upgrade-scripts', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
                    });
                    us.stderr.on('data', data => {
                        console.log(data.toString());
                        socket.emit('upgrade-scripts', {message: data.toString().replace(/\n/gm, '<br />'), srv: qry.srv});
                    });
                    us.on('close', code => {
                        console.log(`child process exited with code ${code}`);
                        socket.emit('upgrade-scripts', {message: `Upgrade Script finished. code ${code}`, srv: qry.srv});
                    });
                }
            });
        } else {
            socket.emit('upgrade-scripts', {message: 'Not Authenticated, please log in.', srv: qry.srv});
        }
    });

    socket.tailObjs = {};
    socket.on('tail', qry => {
        // Join the room
        let room = qry.srv + " " + qry.serv;
        socket.join(room);

        // Create server object
        if (typeof tails[qry.srv] === "undefined") tails[qry.srv] = {};

        // Create service object
        if (typeof tails[qry.srv][qry.serv] === "undefined") {
            tails[qry.srv][qry.serv] = {count: 1};

            // Create child process under service object
            tails[qry.srv][qry.serv].tail = spawn('ssh', ['root@' + qry.srv, qry.script, qry.func, qry.serv], {shell: true});
            if (typeof socket.tailObjs[qry.srv] === 'undefined') {
                socket.tailObjs[qry.srv] = [];
            }
            socket.tailObjs[qry.srv].push(qry.serv);
            // emit log line
            tails[qry.srv][qry.serv].tail.stdout.on('data', data => {
                if (!tails[qry.srv][qry.serv].tail.killed) {
                    // Logic to include the tailing title to the sent object
                    let tailingIndex;
                    let readableData = data.toString().split('\n');
                    for (let i = 0; i < readableData.length; i++) {
                        if (readableData[i].includes('Tailing')) {
                            tailingIndex = i;
                            break;
                        }
                    }
                    if (typeof tailingIndex !== 'undefined') tails[qry.srv][qry.serv].title = readableData[tailingIndex];

                    io.to(room).emit('newLine', {
                        dits: {
                            server: qry.srv,
                            service: qry.serv
                        },
                        line: readableData.join('<br />').replace(tails[qry.srv][qry.serv].title + '<br />', ''),
                        title: tails[qry.srv][qry.serv].title
                    });
                }
            });

            // emit std error
            tails[qry.srv][qry.serv].tail.stderr.on('data', data => {
                // console.log('There are some errors:', data.toString());
                socket.emit('newLine', {error: data.toString()});
            });

            // close tail child process and set undefined to the service
            tails[qry.srv][qry.serv].tail.on('close', () => {
                tails[qry.srv][qry.serv] = undefined
            });
        }
        else {
            // Increment count by 1
            tails[qry.srv][qry.serv].count++;
        }
    });
    //kill tail if disconnect
    socket.on('disconnect', () => {
        for (let server in socket.tailObjs) {
            // skip loop if the property is from prototype
            if (!socket.tailObjs.hasOwnProperty(server)) continue;
            let app = socket.tailObjs[server];
            for (let i = 0; i < app.length; i++) {
                let service = app[i];
                if (typeof tails[server][service] !== 'undefined')
                    deleteTail(server, service);
            }
        }
    });
    socket.on('closeConnection', (obj) => {
        let room = obj.server + ' ' + obj.service;
        if (typeof tails[obj.server][obj.service] !== 'undefined') {
            if (tails[obj.server][obj.service].count > 1) {
                tails[obj.server][obj.service].count--;
            } else {
                return deleteTail(obj.server, obj.service);
            }
        }
        socket.leave(room);
    });
});

// Clean all child processes on exit
process.on('exit', () => {
    for (let server in tails) {
        if (tails.hasOwnProperty(server)) {
            for (let service in tails[server]) {
                if (tails[server].hasOwnProperty(service)) {
                    if (typeof tails[server][service] !== 'undefined') {
                        if (typeof tails[server][service].tail !== 'undefined') {
                            deleteTail(server, service);
                        }
                    }
                }
            }
        }
    }
});
let cleanExit = () => process.exit();
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill