/*jshint node:true*/
'use strict';

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    port = 8000,
    root = __dirname + '/app/';

var environment = process.env.NODE_ENV;

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
console.log('serving from ' + root);

app.use('/', express.static(root));

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
  res.sendFile('index.html', { root: root });
});

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname  +
        '\nprocess.cwd = ' + process.cwd());
    console.log('listening ... ');
});
