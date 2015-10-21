/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var cors = require('cors');
var port = 8000;

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
console.log('serving from ' + './app/ and ./');
app.use('/', express.static('./app/'));
app.use('/', express.static('./'));

app.listen(port, function() {
    console.log('Express server listening on port ' + port);
    console.log('env = ' + app.get('env') +
        '\n__dirname = ' + __dirname  +
        '\nprocess.cwd = ' + process.cwd());
    console.log('listening ... ');
});
