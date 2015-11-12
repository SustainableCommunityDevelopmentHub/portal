(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('esClient', ['elasticsearch', 'portal.config', esClient])
    .factory('dataService', ['esClient', dataServices]);

  /* Elasticsearch Client
  * */
  function esClient(esFactory, config) {
    return esFactory({
      host: config.elastic.host + ':' + config.elastic.port,
      apiVersion: config.elastic.apiVersion,
      log: 'trace'
    });
  };

  /* dataService - get all data through this service
  * */
  function dataServices(esClient) {

    // Expose dataService functions on return object
    var dataService = {
      search: search,
      test: test
    };

    return dataService;


    // dataService functions
    function test(){
      console.log('....dataService is here!');
    };

    // Query elasticsearch
    function search(queryTerm){
      return esClient.search({
        index: 'portal',
        type: 'book',
        q: queryTerm
      });
    };

  };

})();
