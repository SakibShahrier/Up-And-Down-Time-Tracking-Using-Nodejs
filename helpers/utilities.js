

const crypto = require('crypto');
const environments = require('./environments');
const utilities = {};

utilities.parseJSON = (jsonString) =>{
    let output = {};

    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }

    return output;
}

utilities.hash = (str) =>{
    
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256', environments.secretKey)
        .update(str)
        .digest('hex');

        return hash;
    }

    return false;
}

utilities.createRandomString = (strlen)=>{

    let length = strlen;
    length = typeof(strlen) === 'number' && strlen > 0 ? strlen : false;

    if(length){
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let num = possibleCharacters.length;
        let output = '';
        for(let i = 1; i <= length; ++i){
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * num));
            output += randomCharacter;
        }

        return output;
    }else{
        return false;
    }
}


module.exports = utilities;