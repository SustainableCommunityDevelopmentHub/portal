/*jshint node:true*/
'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path');

var port = 8000,
    rootDir = path.join(__dirname, '/app/'),
    environment = process.env.NODE_ENV;

app.use(bodyParser.urlencoded({extended: true}));

console.log('Starting node server ...');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

var source = '';

app.get('/ping', function(req, res, next) {
    console.log(req.body);
    res.send('pong');
});

console.log('** DEV **');
console.log('serving from ' + rootDir);

app.use('/', express.static(rootDir));

app.all('/*', function(req, res, next) {
  console.log('...Sending index.html in response to request: ');
  console.log(req.headers);
  console.log('URL: ' + req.url);
  console.log('PARAMS: ');
  console.log(req.params);
  console.log('QUERY STRING: ');
  console.log(req.query);
  console.log('Original URL: ' + req.originalUrl + ' Base URL: ' + req.baseUrl);
    // Just send the index.html in response to all requests, to support HTML5Mode
  res.sendFile('index.html', { root: rootDir });
});

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname  +
        '\nprocess.cwd = ' + process.cwd());
    console.log('listening ... ');
});
