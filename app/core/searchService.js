/* * SearchService
 *
 * Used for all search-related activity.
 * Run searches, access the response object (a promise).
 * Search result data and search query opts through this service.
 * Handles search variables, overall search state, etc.
 * */

(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SearchService', ['dataService', '_', SearchService]);

  function SearchService(dataService, _){
    var service = {
      // variables - define structure
      response: null,
      hits: null,
      totalHits: null,
      opts: {
        q: null,
        pageSize: null,
        fromPage: null
      },
      //Functions
      search: search,
      setOpts: setOpts,
      setResultsData: setResultsData
    };

    return service;

    // execute search, sets opts, response. Returns a promise.
    function search(opts){
      console.log('SearchService.search()......opts: ' + JSON.stringify(opts));

      // TODO: Naive implementation.
      // Update w/promises to make sure things work successfully and handle errs.
      this.opts = opts;
      this.response = dataService.search(opts);

      console.log('SearchService.search().........Search result promise obj: ' + JSON.stringify(this.response));

      return this.response;
    };

    // set opts. overwrites for new values but preserves existing
    function setOpts(newOpts){
      //TODO: lodash not working
      _.merge(this.opts, newOpts);
    }

    // set SearchService results values once response promise is resolved
    function setResultsData(results){
      this.hits = results.hits.hits;
      this.totalHits = results.hits.total;
    }
  };

})();
