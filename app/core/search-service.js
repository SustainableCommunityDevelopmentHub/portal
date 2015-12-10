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
      /////////////////////////////////
      // Vars
      /////////////////////////////////
      var defaults = {
        pageSize: 25,
        fromPage: 1
      };

      var searchOpts = {
        q: null,
        pageSize: null,
        fromPage: null
      };

      /////////////////////////////////
      // Expose Service
      /////////////////////////////////
      var service = {
        // variables
        response: null,
        hits: null,
        totalHits: null,
        opts: searchOpts,

        // functions
        newSearch: newSearch,
        updateOpts: updateOpts,
        setResultsData: setResultsData
      };

      return service;

      //////////////////////////////////
      //Public Functions
      //////////////////////////////////
      /**
       * Executes new search. Overwrites existing opts,except defaults.
       * @param {Object} opts - search options
       * @returns {Promise} - search results
       */
      // TODO: Naive implementation.
      // Update w/promises to make sure things work successfully and handle errs.
      function newSearch(opts){
        console.log('SearchService.newSearch()......opts: ' + JSON.stringify(opts));
        this.opts = opts;
        this.response = search(this.opts);
        console.log('SearchService.newSearch() response: ' + JSON.stringify(this.response));
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

      ///////////////////////////////////
      //Private Functions
      ///////////////////////////////////
      function search(opts){
        console.log('SearchService.search()......defaults: ' + JSON.stringify(defaults));
        console.log('SearchService.search()......arg opts: ' + JSON.stringify(opts));
        // if no value set default vals -- b/c of pass-by-reference this sets service.opts
        if(!opts.pageSize){
          opts.pageSize = defaults.pageSize;
        }
        if(!opts.fromPage){
          opts.fromPage = defaults.fromPage;
        }
        console.log('executing search.....opts: ' +JSON.stringify(opts));
        return DataService.search(opts);
      };

    };
})();
