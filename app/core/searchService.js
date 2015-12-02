(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SearchService', ['dataService', SearchService]);

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Handles search variables, overall search state, etc.
   * Do not use dataServices directly for search.
   */
  function SearchService(dataService){
    var service = {
      results: null,
      opts: null,

      // Execute search, sets opts, results. Returns a promise.
      search: function(opts){
        console.log('.....in SearchService');
        // TODO: Naive implementation.
        // Update w/promises to make sure things work successfully and handle errs.
        this.opts = opts;
        this.results = dataService.search(opts.q);
        console.log('Executed search with opts: ' + JSON.stringify(opts));
        console.log('......................Search result promise obj: ' + JSON.stringify(this.results));
        return this.results;
      },

    };

    return service;
  };

})();
