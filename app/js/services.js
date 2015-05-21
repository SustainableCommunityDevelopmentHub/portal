'use strict';

/* Services */

var portalServices = angular.module('portalServices', ['elasticsearch']);

portalServices.service('ESclient', function(esFactory) {
  return esFactory({
    host: 'http://localhost:9200',
    apiVersion: '1.3',
    log: 'trace'
  });
});