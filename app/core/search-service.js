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
    // Expose Service
    /////////////////////////////////
    var service = {
      // variables
      response: null,
      hits: null,
      totalHits: null,
      opts: {},

      // functions
      newSearch: newSearch,
      updateSearch: updateSearch,
      runSearch: runSearch,
      updateOpts: updateOpts,
      setResultsData: setResultsData,
      resetOpts: resetOpts
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
      console.log('SearchService.updateSearch()......new opts: ' + JSON.stringify(opts));
      // allow for no opts to be passed
      opts = opts || {};
      _.merge(this.opts, opts);
      console.log('SearchService.updateSearch()...........merged opts: ' + JSON.stringify(opts));
      this.response = search(this.opts);
      console.log('SearchService.newSearch() response: ' + JSON.stringify(this.response));
      return this.response;
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

    /**
     * Clear search opts and reset defaults
     */
    function resetOpts(){
      this.opts = {
        q: null,
        from: 0,
        size: 25,
        page: 1
      };
      console.log('SearchService.resetOpts....opts: ' + JSON.stringify(this.opts));
    }

    ///////////////////////////////////
    //Private Functions
    ///////////////////////////////////
    function search(opts){
      console.log('SearchService.search()......arg opts: ' + JSON.stringify(opts));

      // if no value set default vals
      if(!opts.from){
        opts.from = 0;
      }
      if(!opts.size){
        opts.size = 25;
      }
      // 'page' just used for UI but we want to track in SearchService
      if(!opts.page){
        opts.page = 1;
      }
      console.log('executing search.....opts: ' +JSON.stringify(opts));
      return DataService.search(opts);
    };

  };
})();
