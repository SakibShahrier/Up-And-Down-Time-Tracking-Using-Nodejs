

//dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('../helpers/utilities');
//module
const handler = {};

handler.handleReqRes = (req, res) =>{
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '').toLowerCase();
    const method = req.method.toLowerCase();
    const queryString = parsedUrl.query;
    const headers = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryString,
        headers
    };


    const decoder = new StringDecoder('utf8');
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;
    

    let realData = '';
    req.on('data', (buffer) =>{
        realData += decoder.write(buffer);
    });

    req.on('end', ()=>{
        realData += decoder.end();
        console.log(realData);
        requestProperties.body = parseJSON(realData);
        chosenHandler(requestProperties, (statusCode, payLoad)=>{
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            payLoad = typeof (payLoad) === 'object' ? payLoad : {};
    
            const payLoadString = JSON.stringify(payLoad);
    
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);
        });
    });
}


module.exports = handler;