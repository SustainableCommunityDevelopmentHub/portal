(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SearchService', ['dataService', SearchService]);

  /* SearchService
   *
   * Run searches, access the response object (a promise), search result data and search query opts through this service.
   * Handles search variables, overall search state, etc.
   * Do not use dataServices directly for search.
   */
  function SearchService(dataService){
    var service = {

      // Variables - define structure here, but should not set values.
      response: null,
      hits: null,
      totalHits: null,
      opts: {
        q: null,
        pageSize: null,
        fromPage: null
      },

      //Functions

      // Execute search, sets opts, response. Returns a promise.
      search: function(opts){
        console.log('.....in SearchService');

        // TODO: Naive implementation.
        // Update w/promises to make sure things work successfully and handle errs.
        this.opts = opts;
        this.response = dataService.search(opts.q);

        console.log('Executed search with opts: ' + JSON.stringify(opts));
        console.log('......................Search result promise obj: ' + JSON.stringify(this.response));

        return this.response;
      },

      // Set SearchService results values once response promise is resolved
      setResultsData: function(results){
        this.hits = results.hits.hits;
        this.totalHits = results.hits.total;
      }

    };

    return service;
  };

})();
