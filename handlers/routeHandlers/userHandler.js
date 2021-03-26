
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities');
const {parseJSON} = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

//module

const handler = {};

handler.userHandler = (requestProperties, callback) =>{
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback)=>{
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ?  requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ?  requestProperties.body.lastName : false;
    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ?  requestProperties.body.password : false;
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ?  requestProperties.body.phone : false;
    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' && requestProperties.body.tosAgreement ?  requestProperties.body.tosAgreement : false;


    if(phone && password && tosAgreement && lastName && firstName){
        data.read('users', phone, (err, user)=>{
            if(err){
                let userObj = {
                    firstName,
                    lastName,
                    phone,
                    password : hash(password),
                    tosAgreement
                }

                data.create('users', phone, userObj, (err)=>{
                    if(!err){
                        callback(200,{
                            'message' : 'USer was created successfully!'
                        });
                    }else{
                        callback(500, {
                            'error' : 'Could not create user!'
                        });
                    }
                });

            }else{
                callback(500, {
                    'error' : 'There was a problem in server side!'
                });
            }
        });
    }else{
        callback(400, {
            error: 'You have a problem in your request'
        });
    }
};

handler._users.get = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.queryString.phone) === 'string' && requestProperties.queryString.phone.trim().length === 11 ?  requestProperties.queryString.phone : false;
    
    if(phone){

        let token = typeof(requestProperties.headers.token) === 'string' ? requestProperties.headers.token : false;

        tokenHandler._token.verfiy(token, phone, (tokenId)=>{
            if(tokenId){
                data.read('users', phone, (err, user)=>{
                    const u = {...parseJSON(user)};
                    if(!err && user){
                        delete u.password;
                        callback(200, u);
                    }else{
                        callback(404, {
                            'error' : 'Requested User not found!'
                        });
                    }
                });
            }else{
                callback(403,{
                    error : 'Authentication Failed!'
                })
            }
        });
    }else{
        callback(404, {
            'error' : 'Requested User not found!'
        });
    }
};

handler._users.put = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ?  requestProperties.body.phone : false;
    const firstName = typeof(requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ?  requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ?  requestProperties.body.lastName : false;
    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ?  requestProperties.body.password : false;

    console.log(phone);
    if(phone){

        let token = typeof(requestProperties.headers.token) === 'string' ? requestProperties.headers.token : false;

        tokenHandler._token.verfiy(token, phone, (tokenId)=>{
            if(tokenId){
                if(firstName || lastName || password){
                    data.read('users', phone, (err, uData)=>{
                        const userData = {...parseJSON(uData)};
                        if(!err && userData){
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = hash(password);
                            }
        
                            data.update('users', phone, userData, (err) =>{
                                if(!err){
                                    callback(200, {
                                        'message': 'Updated Successfully!'
                                    });
                                }else{
                                    callback(500, {
                                        'error' : 'There was a problem in server side!'
                                    })
                                }
                            });
                        }else{
                            callback(400, {
                                'error' : 'You have problem in your request!'
                            });
                        }
                    })
                }else{
                    callback(400, {
                        'error': 'You have problem in your request!'
                    })
                }
            }else{
                callback(403,{
                    error : 'Authentication Failed!'
                })
            }
        });
    }else{
        callback(400, {
            'error' : 'Invalid Phone Number!'
        });
    }
};

handler._users.delete = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.queryString.phone) === 'string' && requestProperties.queryString.phone.trim().length === 11 ?  requestProperties.queryString.phone : false;

    if(phone){

        let token = typeof(requestProperties.headers.token) === 'string' ? requestProperties.headers.token : false;

        tokenHandler._token.verfiy(token, phone, (tokenId)=>{
            if(tokenId){
                data.read('users', phone, (err, userData) =>{
                    if(!err && userData){
                        data.delete('users', phone, (err) =>{
                            if(!err){
                                callback(200, {
                                    'message' : 'Successfully Deleted'
                                });
                            }else{
                                callback(500, {
                                    'error' : 'There was a server side error!'
                                });
                            }
                        })
                    }else{
                        callback(500, {
                            'error' : 'There was a server side error!'
                        });
                    }
                });
            }else{
                callback(403,{
                    error : 'Authentication Failed!'
                })
            }
        });
    }else{
        callback(400, {
            'error' : 'There was a problem in your request!'
        });
    }
};

module.exports = handler;