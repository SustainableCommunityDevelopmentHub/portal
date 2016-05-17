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
      /* variables */
      returnedPromise: null,
      results: {
        hits: null,
        numTotalHits: null,
        facetOptions: {}
      },
      opts: getDefaultOptsObj(),
      facetCategoriesList: ['creator', 'grp_contributor', 'language', 'subject'],

      /* functions */
      // general opts update
      updateOpts: updateOpts,
      resetOpts: resetOpts,
      // specific opts update
      updateDate: updateDate,
      // facets
      isValidCategory: isValidCategory,
      isValidFacet: isValidFacet,
      isSameFacet: isSameFacet,
      buildFacet: buildFacet,
      activateFacet: activateFacet,
      deActivateFacet: deActivateFacet,
      clearFacetsIn: clearFacetsIn,
      // utility
      calculatePage: calculatePage,
      parseFacetsToObj: parseFacetsToObj,
      getDefaultOptsObj: getDefaultOptsObj,
      // search execution
      buildQueryParams: buildQueryParams,
      transitionStateAndSearch: transitionStateAndSearch,
      executeSearch: executeSearch,
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
     * Updates opts.
     * @param {Object} opts - search options
     */
    function updateOpts(newOpts){
      newOpts = newOpts || {};
      console.log('SearchService::updateOpts -- newOpts: ' + JSON.stringify(newOpts));

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
     * Returns the default Search Opts object.
     */
    function resetOpts(){
      this.opts = this.getDefaultOptsObj();
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

      var facet = {
        category: category,
        value: value
      };
      if(count !== undefined) { 
        facet.count = count; 
      }
      if(active !== undefined) { 
        facet.active = active; 
      }
      return facet;
    }

    /**
     * Check if string is valid facet category
     * @param {string} category category to check
     * @return {boolean} true if valid
     */
    function isValidCategory(category){
      return (facetCategoriesList.indexOf(category) > -1);
    }

    /**
     * Check if facet is valid
     * Facet considered valid if 'category' param is valid and 'value' param exists.
     * @param {object} facet a facet object
     * @return {boolean} true if valid
     */
    function isValidFacet(facet){
      return Boolean(facet.category && isValidCategory(facet.category) && facet.value);
    }

    /**
     * Check if two facets are the same
     * Compares 'category' and 'value' params only.
     * @param {object} facetA facet object
     * @param {object} facetB facet object
     * @return {boolean} true if same
     */
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
     * Clear facets in a particular category or clear all facets.
     * @param {string} category facet category to clear. or, 'all' to clear all facets
     * @return {boolan} true on success, false if 'category' arg is invalid
     */
    function clearFacetsIn(category){
      if(category === 'all'){
        this.opts.facets = [];
        return true;
      }
      else if(!isValidCategory(category)){
        return false;
      }

      for(var i = 0; i < this.opts.facets.length; i++){
        if(this.opts.facets[i].category === category){
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
