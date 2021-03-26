/*

*/

//dependencies
const data = require('./data');
const environment = require('../helpers/environments');
const {parseJSON} = require('../helpers/utilities');
const url = require('url');
const http = require('http');
const https = require('https');
const {sendTwilioSms} = require('../helpers/notifications');

// Workers object - module
const workers = {};

workers.loop = () =>{
    setInterval(() =>{
        workers.gatherAllChecks();
    }, 5000);
};

workers.performCheck = (originalCheckData) =>{

    let checkOutCome = {
        'error' : false,
        'responseCode' : false
    };
    let outComeSent = false;
    const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        'protocol' : originalCheckData.protocol + ':',
        'hostname' : hostName,
        'method' : originalCheckData.method,
        'path' : path,
        'timeout' : originalCheckData.timeoutSeconds * 1000
    };
    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;
    let req = protocolToUse.request(requestDetails, (res)=>{
        const status = res.statusCode;

        checkOutCome.responseCode = status;
        if(!outComeSent){
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
        
    });

    req.on('error', (err) =>{
        let checkOutCome = {
            'error' : false,
            'value' : err
        };

        if(!outComeSent){
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('timeout', () =>{
        let checkOutCome = {
            'error' : false,
            'value' : 'timeout'
        };

        if(!outComeSent){
            workers.processCheckOutCome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    })

    req.end();
};

workers.alertUserToStatusChange = (newCheckedData)=>{
    let msg = `Alert: Your check for ${newCheckedData.method.toUpperCase()}${newCheckedData.protocol}://${newCheckedData.url} is currently ${newCheckedData.state}`;
    sendTwilioSms(newCheckedData.userPhone, msg, (err) =>{
        if(!err){
            console.log(`User was alerted to status change via SMS: ${msg}`);
        }else{
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

workers.processCheckOutCome = (originalCheckData, checkOutCome)=>{

    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;
    
    let newCheckedData = originalCheckData;

    newCheckedData.state = state;
    newCheckedData.lastChecked = Date.now();

    data.update('checks', newCheckedData.id, newCheckedData ,(err) =>{
        if(!err){
            if(alertWanted){
                workers.alertUserToStatusChange(newCheckedData);
            }else{
                console.log('Alert is not needed as there is no state change!');
            }
        }else{
            console.log('Error trying to save check data of one of the checks!');
        }
    })
};

workers.validateCheckData = (originalCheckData) =>{
    if(originalCheckData && originalCheckData.id){
        originalCheckData.state = typeof(originalCheckData) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData : 'down';
        originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        workers.performCheck(originalCheckData);
    }else{
        console.log('Error : Check was invalid or not properly formatted!');
    }
};

workers.gatherAllChecks = () =>{
    data.list('checks', (err, checks) =>{
        if(!err && checks && checks.length > 0){
            checks.forEach(check =>{
                data.read('checks', check, (err, originalCheckData) =>{
                    if(!err && originalCheckData){
                        workers.validateCheckData(parseJSON(originalCheckData));
                    }else{
                        console.log('Error : reading one of the check data!');
                    }
                });
            });
        }else{
            console.log('Error: Could not find any checks to process!');
        }
    });
}

//Start Server
workers.init = () =>{
    workers.gatherAllChecks();

    workers.loop();
};

module.exports = workers;