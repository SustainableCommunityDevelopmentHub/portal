'use strict';

/* Services */

var portalServices = angular.module('portalServices', ['elasticsearch']);

portalServices.service('ESclient', function(esFactory) {
  return esFactory({
    host: 'http://153.10.131.215:9200',
    apiVersion: '1.3',
    log: 'trace'
  });
});