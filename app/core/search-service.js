(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('SearchService', ['DataService', '_', 'FacetList',SearchService]);

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Use to provide consistent search state to...
   * ..various controllers, etc across application.
   * Handles search variables, overall search state, etc.
   */
  function SearchService(DataService, _, FacetList){

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
      opts: {},


      // functions //
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
      this.returnedPromise = search(this.opts);
      console.log('SearchService.newSearch() returnedPromise: ' + JSON.stringify(this.returnedPromise));
      return this.returnedPromise;
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
      this.returnedPromise = search(this.opts);
      console.log('SearchService.newSearch() returnedPromise: ' + JSON.stringify(this.returnedPromise));
      return this.returnedPromise;
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
      // search query terms always handled as lowercase
      if(newOpts.q){
        newOpts.q = newOpts.q.toLowerCase();
      }
      _.merge(this.opts, newOpts);
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
      this.results.hits = parseResults(results.hits.hits);
      this.results.numTotalHits = results.hits.total;

      // set facet options
      var allAggregations = results.aggregations

      // TODO: Get this working using FacetList.foreach(). The 'this' was undefined when attempting before.
      this.results.facetOptions['language'] = parseAggregationResults(allAggregations['language'], 'language');
      this.results.facetOptions['creator'] = parseAggregationResults(allAggregations['creator'], 'creator');
      this.results.facetOptions['type'] = parseAggregationResults(allAggregations['type'], 'type');
      this.results.facetOptions['subject'] = parseAggregationResults(allAggregations['subject'], 'subject');
      this.results.facetOptions['grp_contributing_institution'] = parseAggregationResults(allAggregations['grp_contributing_institution'], 'grp_contributing_institution');

      console.log('SearchService.setResultsData.........facetOptions.grp_contributing_institution: ' + JSON.stringify(this.results.facetOptions.grp_contributing_institution));
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

    /**
     * parse search result hits data to simplify object structure
     * @param {array} hits from ES response obj. contains search results (hits returned)
     */
    function parseResults(hits){
      return hits.map(function(data){
        var book = data._source;
        // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
        book._id = data._id;
        return book;
      });
    };

    /**
     * parse search result aggregation data for a single aggregation
     * to simplify object struction
     * @param {object} agg from ES response obj. contains an aggregation
     * @param {string} name name of the aggregation. this matches the name of the facet
     */
    function parseAggregationResults(agg, name){
      return agg[name].buckets.map(function(facetOption){
        //console.log('SearchService.parseAggregationResults -- raw facet option: ' + JSON.stringify(facetOption));

        var option = {
          facet: name,
          option: facetOption.key,
          count: facetOption.doc_count
        };
        //console.log('SearchService.parseAggregationResults -- parsed facet option: ' + JSON.stringify(option));

        return option;
      });
    };


  };
})();
