(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('esClient', ['esFactory', 'config', esClient]);

  /* Elasticsearch Client
  * */
  function esClient(esFactory, config) {
    return esFactory({
      host: config.elastic.host + ':' + config.elastic.port,
      apiVersion: config.elastic.apiVersion,
      log: 'trace'
    });
  }

})();
