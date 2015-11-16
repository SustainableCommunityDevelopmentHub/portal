(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('esClient', ['elasticsearch', 'config', esClient])
    .factory('dataService', ['esClient', dataService])
    .factory('SearchService', ['dataService', SearchService]);

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

    console.log('...RETURING DataSErvice factory');
    return service;

    // dataService functions
    function test(){
      console.log('....dataService is here!');
    };

    // Query elasticsearch
    function search(queryTerm){
      console.log('...in dataService search');
      var res = esClient.search({
        index: 'portal',
        type: 'book',
        q: queryTerm
      });
      console.log('~~~~dataService executed, res: ' + JSON.stringify(res));
      return res;
    };

  };

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Handles search variables, overall search state, etc.
   * Do not use dataServices directly for search.
   */
  function SearchService(dataService){
    var service = {
      // Store search results and search opts
      results: null,
      opts: null,

      // Execute a search, sets search opts to most recent search
      // Returns a promise
      search: function(opts){
        console.log('.....in SearchService');
        // TODO: Naive implementation. Update w/promises to make sure things work successfully and handle errs.
        this.opts = opts;
        this.results = dataService.search(opts.q);
        console.log('Executed search with opts: ' + JSON.stringify(opts));
        //console.log('Search result obj: ' + JSON.stringify(this.result));
        return this.results;
      },

    };
  
    return service;
  };

})();
