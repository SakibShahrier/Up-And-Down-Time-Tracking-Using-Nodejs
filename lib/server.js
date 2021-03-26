/*

*/

//dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// Server object - module
const server = {};

server.createServer = () =>{
    const createserverVar = http.createServer(server.handleReqRes);
    createserverVar.listen(environment.port, () =>{
        console.log(`Listening to ${environment.port}`);
    });
}

// handle Request Response

server.handleReqRes = handleReqRes;

//Start Server
server.init = () =>{
    server.createServer();
};

module.exports = server;