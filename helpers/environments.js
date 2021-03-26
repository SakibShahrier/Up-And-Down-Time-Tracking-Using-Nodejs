


// module
const environments = {};

environments.production = {
    port : 5000,
    envName : 'production',
    secretKey : 'huhuhu',
    maxChecks : 5,
    twilio : {
        fromPhone : '+12028313595',
        accountSid : 'ACa984409cca35e20b059ed36ed44ce355',
        token : 'b551800a0d726bd27679d65b554bf5b3'
    }
};

environments.staging = {
    port : 3000,
    envName : 'staging',
    secretKey : 'gugugu',
    maxChecks : 5,
    twilio : {
        fromPhone : '+12028313595',
        accountSid : 'ACa984409cca35e20b059ed36ed44ce355',
        token : 'b551800a0d726bd27679d65b554bf5b3'
    }
};


// determine which env was passed

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV + '' : 'staging';

// export corresponding env obj
const environmentToExport = typeof (environments[currentEnvironment.trim()]) === 'object' 
    ? (environments[currentEnvironment.trim()]) : environments.staging;
module.exports = environmentToExport;