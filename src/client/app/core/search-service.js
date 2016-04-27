(function() {
  /* jshint validthis: true */
  'use strict';

  angular
  .module('app.core')
  .factory('SearchService', ['$state', 'DataService', 'SearchResParser', '_', 'FACETS', 'DEFAULTS', 'SORT_DEFAULT', 'FROM_DEFAULT', 'SIZE_DEFAULT', SearchService]);

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Use to provide consistent search state to...
   * ..various controllers, etc across application.
   * Handles search variables, overall search state, etc.
   */
  function SearchService($state, DataService, SearchResParser, _, FACETS, DEFAULTS, SORT_DEFAULT, FROM_DEFAULT, SIZE_DEFAULT){
    var facetCategoriesList = ['creator', 'grp_contributor', 'language', 'subject'];

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
      opts: getDefaultOptsObj(), // initalize below
      facetCategoriesList: _.clone(facetCategoriesList),

      // functions //
      // general opts
      updateOpts: updateOpts,
      resetOpts: resetOpts,
      // utility
      calculatePage: calculatePage,
      parseFacetsToObj: parseFacetsToObj,
      getDefaultOptsObj: getDefaultOptsObj,
      // update specific opt
      updateDate: updateDate,
      // facets
      isValidCategory: isValidCategory,
      isValidFacet: isValidFacet,
      isSameFacet: isSameFacet,
      buildFacet: buildFacet,
      activateFacet: activateFacet,
      deActivateFacet: deActivateFacet,
      clearFacetsIn: clearFacetsIn,
      // search execution
      buildQueryParams: buildQueryParams,
      transitionStateAndSearch: transitionStateAndSearch,
      executeSearch: executeSearch,
      updateSearch: updateSearch,
      newSearch: newSearch,
      setResultsData: setResultsData,
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
          gte: '',
          lte: ''
        }
      };
    }

    /**
     * Parse search opts obj into URL query params which can be passed
     * into the search results state.
     * @returns {Object} Search opts in query params form
     */
    function buildQueryParams(){
      var queryParams = {};
      queryParams.q = this.opts.q || '';
      queryParams.from = this.opts.from || FROM_DEFAULT;
      queryParams.size = this.opts.size || SIZE_DEFAULT;
      queryParams.sort = this.opts.sort || SORT_DEFAULT;
      if(!this.opts.date){
        queryParams.date_gte = '';
        queryParams.date_lte = '';
      }

      queryParams.date_gte = this.opts.date.gte || '';
      queryParams.date_lte = this.opts.date.lte || '';

      this.facetCategoriesList.forEach(function(category){
        queryParams[category] = [];
      });
      this.opts.facets.forEach(function(facet){
        queryParams[facet.category].push(facet.value);
      });

      console.log('SearchService::buildQueryParams - queryParams: ' + JSON.stringify(queryParams));
      return queryParams;
    }

    /**
     * @returns {object} Data struct of active facets, each object property
     * is a facet category with an array of the active facets in that category.
     */
    function parseFacetsToObj(){
      var _this = this;
      var obj = {};

      this.facetCategoriesList.forEach(function(category){
        obj[category] = [];
        obj[category] = _this.opts.facets.filter(function(facet){
          return facet.category === category;
        });
      });

      console.log('SearchService::parseFacetsToObj - facets obj: ' + JSON.stringify(obj));
      return obj;
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
      this.returnedPromise = this.executeSearch();
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
      this.returnedPromise = this.executeSearch();
      return this.returnedPromise;
    }

    /**
     * Updates opts.
     * @param {Object} opts - search options
     */
    function updateOpts(newOpts){
      newOpts = newOpts || {};

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

      console.log('SearchService::updateOpts -- opts now: ' + JSON.stringify(this.opts));
      return this.opts;
    }

    /**
     * Update date filter
     * @param {string} gte - date greater than or equal to
     * @param {string} lte - date less than or equal to
     * @return {bool} returns true on successful update
     */
    function updateDate(gte, lte){
      if(!this.opts.date){
        this.opts.date = { gte: '', lte: '' };
      }
      if(gte){
        this.opts.date.gte = gte;
      }
      if(lte){
        this.opts.date.gte = lte;
      }
      return true;
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
      var _this = this;
      this.facetCategoriesList.forEach(function(category){
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
      this.clearFacetsIn('all');
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

    /**
     * Construct a facet object
     * @param {string} category valid facet cateogry - required
     * @param {string} value such as 'art' or 'picasso' - required
     * @param {int} count can be null - number of hits associated w/this facet - optional
     * @param {boolean} active if facet is active or not- optional
     */
    function buildFacet(category, value, count, active){
      if(!isValidCategory(category) || !value){
        return false;
      }

      return {
        category: category,
        value: value,
        count: count || null,
        active: active || null
      };
    }

    function isValidCategory(category){
      return (facetCategoriesList.indexOf(category) > -1);
    }

    function isValidFacet(facet){
      if(!facet.category || !facet.value){
        return false;
      }
      if(!isValidCategory(facet.category)){
        return false;
      }
      return true;
    }

    function isSameFacet(facetA, facetB){
      if(facetA.category.toLowerCase() !== facetB.category.toLowerCase()){
        return false;
      }
      if(facetA.value.toLowerCase() !== facetB.value.toLowerCase()){
        return false;
      }
      return true;
    }

    /**
     * Set a facet's 'active' prop to true, and adds to opts.facets[]
     * @param {Object} Valid facet object
     * @returns {Bool} True if facet successfully added,
     * false if facet obj was invalid or failure.
     */
    function activateFacet(facet){
      var dupeFacet = false;

      if(!isValidFacet(facet)){
        return false;
      }
      facet.active = true;

      this.opts.facets.forEach(function(otherFacet){
        if(isSameFacet(facet, otherFacet)){
          otherFacet.active = true;
          dupeFacet = true;
        }
      });
      if(!dupeFacet){
        this.opts.facets.push(facet);
      }
      console.log('SearchService::activateFacet -- this.opts.facets[] after new facet: ' + JSON.stringify(this.opts.facets));
      return true;
    }

    /**
     * Set a facet's 'active' prop to false, remove from opts.facets[]
     * @param {Object} Valid facet obj
     * @returns {Bool} True if facet successfully removed,
     * false if facet obj was invalid or failure.
     */
    function deActivateFacet(facet){
      if(!isValidFacet(facet)){
        return false;
      }
      facet.active = false;
      _.remove(this.opts.facets, function(f){
        return isSameFacet(facet, f);
      });
    }
    /**
     * Clear all facets in a particular category.
     * Or, pass 'all' as an arg to clear all facets in all categories.
     * Returns number of facets removed on success.
     */
    function clearFacetsIn(category){
      if(category === 'all'){
        this.opts.facets.forEach(function(facet){
          facet.active = false; // so facet doesn't get reset
        });
        this.opts.facets = [];
        return true;
      }
      else if(!isValidCategory(category)){
        return false;
      }

      for(var i = 0; i < this.opts.facets.length; i++){
        if(this.opts.facets[i].category === category){
          this.opts.facets[i].active = false; // so facet doesn't get reset
          this.opts.facets.splice(i, 1);
        }
      }
      return true;
    }

    /**
     * Transition to SearchResults state
     * and pass query parameters for search options.
     * In SearchResults state search options will be set
     * based on query params and an Elasticsearch query executed.
     */
    function transitionStateAndSearch(){
      $state.go('searchResults', this.buildQueryParams(), {reload: true});
    }

    ///////////////////////////////////
    //Private Functions
    ///////////////////////////////////

    function executeSearch(){
      // if no value set default vals
      if(!this.opts.q){
        this.opts.q = '';
      }
      this.opts.q = this.opts.q.toLowerCase();

      if(!this.opts.from){
        this.opts.from = FROM_DEFAULT;
      }
      if(!this.opts.size){
        this.opts.size = SIZE_DEFAULT;
      }
      if(!this.opts.sort){
        this.opts.sort = SORT_DEFAULT;
      }
      this.opts.sort.toLowerCase();
      if(!this.opts.date){
        this.opts.date = {
          gte: '',
          lte: ''
        };
      }
      if(this.opts.date && !(this.opts.date.gte || this.opts.date.lte)){
        this.opts.date = {
          gte: '',
          lte: ''
        };
      }
      if(this.opts.advancedFields && !this.opts.advancedFields.length){
        this.opts.advancedFields = [];
      }

      console.log('SearchService::executeSearch() -- executing with opts: ' +JSON.stringify(this.opts));
      return DataService.search(this.opts);
    }
  }
})();
