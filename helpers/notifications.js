


const https = require('https');
const queryString = require('querystring');
const {twilio} = require('./environments');


//module
const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) =>{
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone : false;
    const userMsg = typeof(msg) === 'string' && msg.trim().length <= 1600 ? msg : false;

    if(userPhone && userMsg){
        const payLoad = {
            From : twilio.fromPhone,
            To : `+88${userPhone}`,
            Body : userMsg
        }

        const stringifyPayLoad = queryString.stringify(payLoad);
        const requestDetails = {
            hostname : 'api.twilio.com',
            method : 'POST',
            path : `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth : `${twilio.accountSid}:${twilio.token}`,
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        }

        const req = https.request(requestDetails, (res)=>{
            const status = res.statusCode;
            if(status === 200 || status === 201){
                callback(false);
            }else{
                callback(`Status code returned was ${status}`);
            }

        });

        req.on('error', (err) =>{
            callback(err);
        });
        
        req.write(stringifyPayLoad);
        req.end();
    }else{
        callback('Given parameters were missing or invalid!');
    }
};

module.exports = notifications;