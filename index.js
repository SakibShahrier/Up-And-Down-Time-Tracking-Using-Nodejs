/*

*/

//dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');
const server = require('./lib/server');
const workers = require('./lib/workers');

// app object - module
const app = {};

app.init = () =>{
    server.init();


    workers.init();
};

app.init();

module.exports = app;