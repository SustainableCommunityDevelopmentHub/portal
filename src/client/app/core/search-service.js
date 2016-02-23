(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('SearchService', ['DataService', 'SearchResParser', '_', 'FACETS',SearchService]);

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Use to provide consistent search state to...
   * ..various controllers, etc across application.
   * Handles search variables, overall search state, etc.
   */
  function SearchService(DataService, SearchResParser, _, FACETS){
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////
    
    var service = {
      // variables //
      returnedPromise: null,
      results: {
        hits: null,
        numTotalHits: null,
        facetOptions: {}
      },
      // search query options/params
      opts: {
        facets: []
      },


      // functions //
      newSearch: newSearch,
      updateSearch: updateSearch,
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
      this.returnedPromise = search(this.opts);
      console.log('SearchService.newSearch() returnedPromise: ' + JSON.stringify(this.returnedPromise));
      return this.returnedPromise;
    }

    /**
     * Updates opts (changed object properties are overwritten) and executes search.
     * @param {Object} opts - changed search options
     * @returns {Promise} - search results
     */
    function updateSearch(opts){
      console.log('SearchService.updateSearch()......new opts: ' + JSON.stringify(opts));
      // allow for no opts to be passed
      opts = opts || {};
      _.merge(this.opts, opts);
      console.log('SearchService.updateSearch()...........merged opts: ' + JSON.stringify(opts));
      this.returnedPromise = search(this.opts);
      console.log('SearchService.updateSearch() returnedPromise: ' + JSON.stringify(this.returnedPromise));
      return this.returnedPromise;
    };

    /**
     * Updates opts.
     * @param {Object} opts - search options
     */
    // TODO? Strip Angular.js $$hashKey prop from facet opts objs?
    function updateOpts(newOpts){
      // search query terms always handled as lowercase
      if(newOpts.q){
        newOpts.q = newOpts.q.toLowerCase();
      }
      _.merge(this.opts, newOpts);

      // hack to handle correctly deleting all facets
      if(newOpts.facets && !newOpts.facets.length){
        this.opts.facets = [];
      }
    }

    /**
     * Set SearchService results values once response promise is resolved
     * Parse data from ES into desired format. Assign to SearchService and return
     *
     * @param {Object} results - Results object from Elasticsearch
     * @return {Object} object with a property for each search result type we're interested in.
     */
    function setResultsData(results){
      // set hits returned by search
      this.results.hits = SearchResParser.parseResults(results.hits.hits);
      this.results.numTotalHits = results.hits.total;

      // set facet options
      var allAggregations = results.aggregations;

      // convert FACETS obj to array, iterate over it, parse aggregation results...
      // ...and update SearchService.results.facetOptions.
      // must do `var_this = this` so 'this' is correct inside the forEach(), otherwise failure.
      var _this = this;
      var FACETS_ARR = _.values(FACETS);

      FACETS_ARR.forEach(function(FACET){
        _this.results.facetOptions[FACET.name] = SearchResParser.parseAggregationResults(results.aggregations[FACET.name], FACET.name, _this.opts.facets);
      });

      // return parsed data so it can be assigned on scope or elsewhere
      var obj = {
        hits: this.results.hits,
        numTotalHits: this.results.numTotalHits,
        facets: this.results.facetOptions
      };

      return obj;
    }

    /**
     * Clear search opts and reset defaults
     */
    function resetOpts(){
      this.opts = {
        q: "",
        from: 0,
        size: 25,
        page: 1,
        facets: []
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
    }

  }
})();