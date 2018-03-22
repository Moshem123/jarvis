const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');


// Helper functions
function write2Log(msg) {
    let logFile = '/var/log/sms.log';
    const isWin = /^win/.test(process.platform);
    (isWin) && (logFile = path.normalize('C:\\\\tradair\\\\logs\\\\jarvis\\\\sms.log'));

    fs.appendFile(logFile, "\n" + new Date().toString("yyyyMMddHHmmss").replace(/T/, ' ').replace(/\..+/, '') + ": " + msg, function (err) {
        if (err) return console.error(err);
    });
}
function sendTheSMS(vPhone, vMessage) {
    console.log("Sending SMS to: " + vPhone + " Message: " + vMessage);
    write2Log("Sending SMS to: " + vPhone + " Message: " + vMessage);
    const params = {
        Message: vMessage.replace(/_/g, ' ').replace(/<br>/g, '\n\r'), /* required */
        MessageStructure: 'String',
        PhoneNumber: vPhone
    };
    const sns = new AWS.SNS({region: 'eu-west-1'});

    return new Promise(resolve => (
        sns.publish(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                write2Log("send SMS " + vMessage);
                err.status = 'notok';
                resolve(err);
             } // an error occurred
            console.log(data);
            write2Log(JSON.stringify(data));
            data.status = 'ok';
            resolve(data);
        })
    ));
}

// Named export
export function sendSMS(req, res){
    // Sanity checks
    if (Object.keys(req.body).length === 0) {
        return res.send({message: 'Please include a message and numbers to send to.'});
    }
    if (typeof req.body.message === 'undefined') {
        return res.send({message: 'Please include a message.'});
    }
    if (typeof req.body.numbers === 'undefined') {
        return res.send({message: 'Please include numbers.'});
    }
    const {message, numbers} = req.body;
    let nums = [];
    if (typeof numbers === 'string') {
        nums = numbers.split(' ');
    } else {
        nums = numbers;
    }
    nums.forEach(val => {
        if (!/\+\d{12}/g.test(val)) {
            return res.send({message: `Number ${val} is not valid.`});
        }
    });

    // Send the sms
    const itemPromises = nums.map(val => sendTheSMS.call(this, val, message));
    // Send server response once all promises fulfilled.
    Promise.all(itemPromises)
        .then(data => {
            console.log(data);
            res.send(data);
        })
        .catch(data => {
            console.log(data);
        });
}