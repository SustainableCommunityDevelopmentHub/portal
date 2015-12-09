(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SearchService', ['DataService', '_', SearchService]);

    /* SearchService
     *
     * Run searches, access results and search query opts through this service.
     * Use to provide consistent search state to...
     * ..various controllers, etc across application.
     * Handles search variables, overall search state, etc.
     */
    function SearchService(DataService, _){
      var service = {
        // variables - define structure here
        response: null,
        hits: null,
        totalHits: null,
        opts: {
          q: null,
          pageSize: null,
          fromPage: null
        },

        //Functions
        newSearch: newSearch,
        updateOpts: updateOpts,
        setResultsData: setResultsData
      };

      return service;

      /**
       * Executes new search. Overwrites existing opts,except defaults.
       * @param {Object} opts - search options
       * @returns {Promise} - search results
       */
      function newSearch(opts){
        console.log('SearchService.newSearch()......opts: ' + JSON.stringify(opts));

        // TODO: Naive implementation.
        // Update w/promises to make sure things work successfully and handle errs.
        this.opts = opts;
        this.response = DataService.search(opts);

        console.log('SearchService.newSearch().........Search result promise obj: ' + JSON.stringify(this.response));

        return this.response;
      };

      /**
       * Updates opts and executes search.
       * @param {Object} opts - search options
       * @returns {Promise} - search results
       */
      function updateSearch(opts){
      };

      /**
       * Executes search on existing opts.
       * @returns {Promise} - search results
       */
      function runSearch(){
      };

      /**
       * Updates opts.
       * @param {Object} opts - search options
       */
      function updateOpts(newOpts){
        //TODO: lodash not working
        _.merge(this.opts, newOpts);
      }

      /**
       * Set SearchService results values once response promise is resolved
       * @param {Object} results - Results object from Elasticsearch
       */
      function setResultsData(results){
        this.hits = results.hits.hits;
        this.totalHits = results.hits.total;
      }
    };

})();
