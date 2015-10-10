'use strict'
var config = require('config'),
    fs = require('fs'),
    appConfigObj = {},
    fileName = 'app/assets/config.json';

appConfigObj.es = config.es;
fs.writeFile(fileName, JSON.stringify(appConfigObj), function(err) {
    if(err) {
        console.log(err);
    }
});

