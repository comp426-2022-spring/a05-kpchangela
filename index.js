// Import Express.js
const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');

const db = require("./src/services/database.js");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'));

const args = require("minimist")(process.argv.slice(2))
args['port']
args['debug']
args['help']
args['log']

if (args['help']) {
    const helpText = `server.js [options]
    --por		Set the port number for the server to listen on. Must be an integer
                    between 1 and 65535.
  
    --debug	If set to true, creates endlpoints /app/log/access/ which returns
                    a JSON access log from the database and /app/error which throws 
                    an error with the message "Error test successful." Defaults to 
          false.
  
    --log		If set to false, no log files are written. Defaults to true.
          Logs are always written to database.
  
    --help	Return this message and exit.`
    console.log(helpText)
    process.exit(0);
}

const HTTP_PORT = args.port ? args.port : 5555;
const logs = args.log ? args.log : "true";
const debug = args.debug ? args.debug : "false";

const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
});

if (logs != "false") {
    const WRITESTREAM = fs.createWriteStream('./access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: WRITESTREAM }))
}

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.secure ? 1 : 0, logdata.status, logdata.referer, logdata.useragent);
    res.status(200);
    next();
});

app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    //Respond with status message "OK"
    res.statusMessage = "OK";
    res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
    res.end(res.statusCode + ' ' + res.statusMessage);
});

app.get('/app/flip', (req, res) => {
    const flip = coinFlip();
    res.statusCode = 200;
    res.json({ "flip": flip });
});

app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.params.number);
    const summary = countFlips(flips);

    res.statusCode = 200;
    res.json({ "raw": flips, "summary": summary })
});

app.get('/app/flip/call/:guess', (req, res) => {
    const result = flipACoin(req.params.guess);

    res.statusCode = 200;
    res.json(result);
});

app.post('/app/flip/coins', (req, res, next) => {
    const flips = coinFlips(req.body.number);
    const count = countFlips(flips);
    res.status(200).json({"raw": flips, "summary": count})
});

app.post('/app/flip/call', (req, res, next) => {
    const result = flipACoin(req.body.call);
    res.status(200).json(result);
});

if (debug != "false") {
    app.get('/app/log/access', (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all()
            res.status(200).json(stmt)
        } catch {
            console.error(e)
        }
    });

    app.get('/app/error', (req, res) => {
        throw new Error("Error test successful");
    });
}

app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND')
});

function coinFlip() {
    return (Math.round(Math.random()) == 0) ? 'heads' : 'tails';
}

function coinFlips(flips) {
    let allFlips = [];
    for (let i = 0; i < flips; i++) { allFlips.push(coinFlip()); }
    return allFlips;
}

function countFlips(array) {
    let heads = 0;
    let tails = 0;
    let countObject;
  
    for(let i = 0; i < array.length; i++){
      if (array[i] === 'heads') { heads++; }
      else{ tails++; }
    }
    if (heads > 0 && tails > 0) { countObject = {heads: heads, tails: tails}; }
    else if (tails == 0) { countObject = {heads: heads} }
    else { countObject = {tails: tails} }
    return countObject;
}

function flipACoin(call) {
    let output = { call: call, flip: "", result: "" };
    output.flip = coinFlip();
    output.result = output.flip === call ? "win" : "lose";
    return output;
}