/* eslint-disable */
import config from '../config';

const app = require('../index').app;
const ActiveDirectory = require('activedirectory');
const ad = new ActiveDirectory(config.ldap);
const jwt = require('jsonwebtoken');
const logger = require('winston');

// Helper function
function authorizedFunc(name, groups) {
    // Set the authorized environments a user can see based on his AD groups
    let authEnvs = [];
    for (let i = 0; i < groups.length; i++) {
        if (config.authorization[groups[i]])
            authEnvs = [...authEnvs, ...config.authorization[groups[i]][name]];
    }
    // Get unique
    authEnvs = [...new Set(authEnvs)];
    return authEnvs;
}

// Named exports

// Perform the jwt verification
export function verification(token) {
    return new Promise((resolve, reject) => {
        if (token) {
            return jwt.verify(token, app.get('superSecret'), (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        } else {
            return reject('No token.');
        }
    });
}

export function login(req, res) {
    if (req.body.email.indexOf('@tradair.com') === -1) req.body.email += '@tradair.com';
    let eMail = req.body.email.replace('tradair.com', 'tradair.amazonworkspaces.com');
    let isTimeout = false;
    let checkTimeout = setTimeout(() => {
        isTimeout = true;
        return res.status(401).send({
            status: 'notok',
            message: 'ERROR: Maybe you\'re not connected to the VPN?'
        });
    }, 3000);
    ad.authenticate(eMail, req.body.password, (err, auth) => {
        if (isTimeout) return;
        clearTimeout(checkTimeout);
        if (err) {
            console.log('ERROR: ' + err);
            return res.status(401).send({
                status: 'notok',
                message: 'Email or Password incorrect.'
            });
        }

        // Find user by a sAMAccountName
        const userName = eMail.replace(/@.*/, '');
        ad.findUser(userName, (err, user) => {
            ad.getGroupMembershipForUser(userName, (err, groups) => {
                if (err) {
                    console.log('ERROR: ' + JSON.stringify(err));
                    return;
                }

                if (!groups) console.log('User: ' + userName + ' not found.');
                else {
                    let groupsArr = groups.filter(val => val.cn).map(val => val.cn);
                    const token = jwt.sign(
                        {
                            email: req.body.email,
                            fName: user.givenName,
                            lName: user.sn,
                            groups: groupsArr
                        },
                        app.get('superSecret'),
                        {expiresIn: '8h'}
                    );
                    logger.info(`User logged in - ${user.givenName} ${user.sn} - ${req.body.email}`);
                    return res
                        .status(200)
                        .cookie('boAuth', token, {
                            maxAge: 28800000,
                            httpOnly: true
                        })
                        .send({
                            status: 'ok',
                            message: 'User Successfuly logged in.',
                            data: {
                                fName: user.givenName,
                                lName: user.sn,
                                groups: groupsArr,
                                token: token
                            }
                        });
                }
            });

        });
    });
}

export function logout(req, res) {
    logger.info(`User logged out - ${data.fName} ${data.lName}`);
    return res.cookie('boAuth', '', {expires: new Date(0)}).send({
        status: 'ok',
        message: 'User Successfuly logged out.'
    });
}

export function isAuthenticated(req, res) {
    res.send({
        status: 'ok',
        message: 'User is logged in',
        data: Object.assign(req.data, {token: req.headers.authorization.split(' ')[1]})
    });

}

export function verifyToken(req, res, next) {
    let token;
    try {
        token = req.headers.authorization.split(' ')[1] || req.cookies.boAuth;
    } catch (err) {
        return res.status(401).send({
            status: 'notok',
            message: 'Not logged in.'
        });
    }

    if (token) {
        verification(token)
            .then(data => {
                req.data = data;
                next();
            })
            .catch(err => {
                console.log('bad login - no token ' + err);
                return res.status(401).send({
                    status: 'notok',
                    message: 'Not logged in.'
                });
            });
    } else {
        // if there is no token
        console.log('request denied - no token');
        return res.status(401).send({
            status: 'notok',
            message: 'Not logged in.'
        });
    }
}

export function checkIfSuper(req, res, next) {
    // Allow only "SuperProd-Users" to create\delete a host
    if (req.data.groups.indexOf("SuperProd-Users") !== -1) {
        next();
    } else {
        return res.status(403).send({status: 'notok', message: `Not authorized!`});
    }
}

export function authorizedEnvironments(req, res, next) {
    req.authEnvironments = authorizedFunc('environments', req.data.groups);
    next();
}

export function authorizedTypes(req, res, next) {
    req.authTypes = authorizedFunc('types', req.data.groups);
    next();
}