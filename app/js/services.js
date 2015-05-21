'use strict';

/* Services */

var portalServices = angular.module('portalServices', ['elasticsearch']);

portalServices.service('ESclient', function(esFactory) {
  return esFactory({
    host: 'http://192.168.59.103:9200',
    apiVersion: '1.3',
    log: 'trace'
  });
});