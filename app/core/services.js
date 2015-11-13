(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('esClient', ['elasticsearch', 'config', esClient])
    .factory('dataService', ['esClient', dataService])
    .factory('searchService', ['dataService', searchService]);

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
  function dataService(esClient) {

    // Expose dataService functions on return object
    var service = {
      search: search,
      test: test
    };

    return service;

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

  /* searchService
   *
   * Run searches, access results and search query params through this service.
   * Handles search variables, overall search state, etc.
   * Do not use dataServices directly for search.
   */
  function searchService(dataService){

    var service = {
      // Execute a search, sets search params to most recent search
      // Returns a promise
      search: function(opts){
        // TODO: Naive implementation. Update w/promises to make sure things work successfully
        this.params = opts;
        return dataService.search(opts.q);
      },

      // Store search results and search params
      results: null,
      params: null,
    };

    return service;
  };

})();
