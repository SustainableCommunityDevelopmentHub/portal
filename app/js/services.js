'use strict';


var client = new elasticsearch.Client({
  host: 'http://153.10.131.215:9200',
  apiVersion: '1.3',
});

/* Services */

var portalServices = angular.module('portalServices', ['ngResource']);

portalServices.factory('ESclient', function() {
  var client = new elasticsearch.Client({
    host: 'http://153.10.131.215:9200',
    apiVersion: '1.3',
  });
  return client;
})