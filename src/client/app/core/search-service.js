(function() {
  /* jshint validthis: true */
  'use strict';

  angular
  .module('app.core')
  .factory('SearchService', ['DataService', 'SearchResParser', 'searchOptions', '_', 'FACETS', 'DEFAULTS', 'SORT_DEFAULT', 'FROM_DEFAULT', 'SIZE_DEFAULT', SearchService]);

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Use to provide consistent search state to...
   * ..various controllers, etc across application.
   * Handles search variables, overall search state, etc.
   */
  function SearchService(DataService, searchOptions, SearchResParser, _, FACETS, DEFAULTS, SORT_DEFAULT, FROM_DEFAULT, SIZE_DEFAULT){
    var facetCategoriesList = ['language', 'subject', 'creator', 'grp_contributor'];

    // initialize searchOptions singleton
    searchOptions = getDefaultOptsObj();

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
      opts: searchOptions, // search query options/params

      // functions //
      newSearch: newSearch,
      updateSearch: updateSearch,
      updateOpts: updateOpts,
      setResultsData: setResultsData,
      resetOpts: resetOpts,
      calculatePage: calculatePage,
      parseFacetsArrToObj: parseFacetsArrToObj,
      getDefaultOptsObj: getDefaultOptsObj
    };

    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * Return object with correct data structure for search opts
     * and default search opts settings
     */
    function getDefaultOptsObj(){
      return {
        from: FROM_DEFAULT,
        size: SIZE_DEFAULT,
        q: '',
        sort: SORT_DEFAULT,
        facets: [],
        advancedFields: [],
        date: {
          gte: null,
          lte: null
        }
      };
    }

    /**
     * Convert facets[] array into an object w/a property for each facet category
     * which contains active facets
     */
    function parseFacetsArrToObj(facetsArr){
      if(facetsArr && facetsArr.length){
        var facetCategories = {
          creator: [],
          grp_contributor: [],
          language: [],
          subject: [],
          type: []
        };

        facetsArr.forEach(function(facet){
          facetCategories[facet.facet].push(facet.option);
        });

        console.log('~~~~~~~parseFacetsArrToObj::facetCategories: ' + JSON.stringify(facetCategories));
        return facetCategories;
      }

      return false;
    }
    /**
     * Executes new search. Overwrites existing opts,except defaults.
     * @param {Object} opts - search options
     * @returns {Promise} - search results
     */
    // TODO: Naive implementation.
    // Update w/promises to make sure things work successfully and handle errs.
    function newSearch(opts){
      console.log('SearchService.newSearch() -- opts: ' + JSON.stringify(opts));
      this.opts = opts;
      this.returnedPromise = search(this.opts);
      return this.returnedPromise;
    }

    /**
     * Updates opts (changed object properties are overwritten) and executes search.
     * @param {Object} opts - changed search options
     * @returns {Promise} - search results
     */
    function updateSearch(opts){
      console.log('SearchService.updateSearch() -- new opts: ' + JSON.stringify(opts));
      // allow for no opts to be passed
      opts = opts || {};
      this.updateOpts(opts);
      //_.merge(this.opts, opts);
      console.log('SearchService.updateSearch() -- merged opts: ' + JSON.stringify(opts));
      this.returnedPromise = search(this.opts);
      return this.returnedPromise;
    }

    /**
     * Updates opts.
     * @param {Object} opts - search options
     */
    // TODO? Strip Angular.js $$hashKey prop from facet opts objs?
    function updateOpts(newOpts){
      if(newOpts.q){
        newOpts.q = newOpts.q.toLowerCase();
      }
      if(newOpts.sort && (typeof newOpts.sort === 'object') && newOpts.sort.mode){
        newOpts.sort = newOpts.sort.mode;
      }

      _.merge(this.opts, newOpts);

      // hack to handle correctly deleting all facets and advanced fields
      if(newOpts.facets && !newOpts.facets.length){
        this.opts.facets = [];
      }

      if(newOpts.date && !(newOpts.date.gte || newOpts.date.lte)){
        this.opts.date = {};
      }

      if(newOpts.advancedFields && !newOpts.advancedFields.length){
        this.opts.advancedFields = [];
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

      this.results.hits = SearchResParser.parseResults(results.hits.hits);
      this.results.numTotalHits = results.hits.total;

      // set facet options
      var allAggregations = results.aggregations;

      // must do `var_this = this` so 'this' is correct inside the forEach(), otherwise failure.
      //TODO: move _this to top of file
      var _this = this;

      facetCategoriesList.forEach(function(category){
        _this.results.facetOptions[category] = SearchResParser.parseAggregationResults(results.aggregations[category][category], category, _this.opts.facets);
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
      this.opts = this.getDefaultOptsObj();
      console.log('SearchService.resetOpts() -- opts: ' + JSON.stringify(this.opts));
    }

    /*
     * Calculate current page based on 'from' and 'size' params
     * @return {int} the current page
     */
    function calculatePage() {
      // Math.ceil so the page comes out right for times like from=30, size=25
      var page = 1 + Math.ceil(this.opts.from / this.opts.size);
      return page;
    }

    ///////////////////////////////////
    //Private Functions
    ///////////////////////////////////

    function search(opts){
      // if no value set default vals
      if(!opts.from){
        opts.from = DEFAULTS.searchOpts.from;
      }
      if(!opts.size){
        opts.size = DEFAULTS.searchOpts.size;
      }

      console.log('SearchService::search() -- executing with opts: ' +JSON.stringify(opts));
      return DataService.search(opts);
    }

  }
})();
