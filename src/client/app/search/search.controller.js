(function() {
  'use strict';

  angular
  .module('app.search')
  .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'SavedRecordsService', 'searchResults', 'SORT_MODES', 'DEFAULTS', 'FACETS', 'SORT_DEFAULT', '_', SearchCtrl]);

  function SearchCtrl($scope, $state, SearchService, SavedRecordsService, searchResults, SORT_MODES, DEFAULTS, FACETS, SORT_DEFAULT, _){
    /////////////////////////////////
    //Init
    /////////////////////////////////

    var ss = SearchService;

    $scope.hits = searchResults.hits;
    $scope.numTotalHits = searchResults.numTotalHits;
    $scope.facets = searchResults.facets;

    // bind search opts to scope
    $scope.activeFacets = ss.opts.facets;
    $scope.advancedFields = ss.opts.advancedFields;

    $scope.fromDate = "";
    $scope.toDate = "";
    if (ss.opts.date) {
      $scope.dateRange = ss.opts.date;
      $scope.fromDate = ss.opts.date.gte;
      $scope.toDate = ss.opts.date.lte;
    }

    $scope.queryTerm = ss.opts.q;
    $scope.newQueryTerm = "";
    $scope.pagination = {
      // must parseInt so is treated as int in code
      page : ss.calculatePage(),
      size : parseInt(ss.opts.size),
      from : parseInt(ss.opts.from)
    };

    $scope.categories = FACETS;

    if(ss.opts.sort){
      $scope.sort = SORT_MODES[ss.opts.sort].display;
    } else {
      $scope.sort = SORT_MODES[SORT_DEFAULT].display;
    }

    console.log('SearchCtrl::$scope.sort: ' + JSON.stringify($scope.sort));
    console.log('SearchCtrl::$scope.pagination: ' + JSON.stringify($scope.pagination));
    console.log('SearchCtrl::$scope.numTotalHits: ' + $scope.numTotalHits);

    if(ss.opts.facets){
      $scope.activeFacets = ss.opts.facets;
    }
    $scope.savedRecords = SavedRecordsService.getRecords();

    $scope.bookMarkText = "";
    saveSearch(ss.opts, $scope.numTotalHits);


    /////////////////////////////////
    //Variables
    /////////////////////////////////
    $scope.allPageSizeOptions = [10,25,50,100];
    $scope.validSortModes = SORT_MODES;
    $scope.validPageSizeOptions = getValidPageSizeOptions($scope.numTotalHits);

    ///////////////////////////
    //Private/Helper Functions
    ///////////////////////////


    /**
     * Clear all active facets from controller. Does not update SearchService or retrigger search.
     * Should always run updateSearch() w/new facet opts after executing this function.
     */
    function clearActiveFacets(){
      // need to do this so facets don't reset themselves
      $scope.activeFacets.forEach(function(facet){
        facet.active = false;
      });
      $scope.activeFacets = [];
      $scope.advancedFields = [];
    }

    /**
     * reload search result state to trigger search.
     * if no opts passed uses SearchService.opts.
     */
    function updateSearch(opts) {
      // use SearchService.opts as canonical
      ss.updateOpts(opts);
      console.log('SearchCtrl::updateSearch() -- add\'l opts: ' + JSON.stringify(opts));
      console.log('SearchCtrl::updateSearch() -- merged SearchService.opts: ' + JSON.stringify(ss.opts));
      ss.transitionStateAndSearch();
    }

    /**
     * Saves current search options to storage
     * @param searchOpts {object} options to save
     * @param results {integer} number of results for search options
     */
    function saveSearch (searchOpts, results) {
      var timestamp = Date.now();
      SavedRecordsService.saveSearch(searchOpts, results, timestamp);
    }


    function getValidPageSizeOptions(numTotalHits){
      var passedThreshold = false;
      return $scope.allPageSizeOptions
        .filter(function(pageSize){
          // return pageSizeOption 1 greater than numTotalHits,
          // so all hits can be viewed on 1 page.
          if(!passedThreshold && (pageSize >= numTotalHits)){
            passedThreshold = true;
            return pageSize;
          }
          return pageSize <= numTotalHits;
        });
    }


    /////////////////////////////////
    //Functions
    /////////////////////////////////

    /**
     * init search on new query term
     * Adding new query term to previous query term
     */
    $scope.newQuerySearch = function(query){
      var newQuery;
      if (query) {
        newQuery = query.trim();
        if ($scope.queryTerm) {
          newQuery = $scope.queryTerm + " " + newQuery;
        }
        $scope.queryTerm = newQuery;
      } else {
        newQuery = $scope.queryTerm;
      }
      console.log('SearchCtrl....$scope.newQuerySearch: ' + query);
      var opts = {
        q: newQuery
      };

      // if new query term or empty string query term, need to reset pagination
      if(!opts.q || (opts.q !== ss.opts.q) ){
        opts.from = 0;
        opts.sort = SORT_MODES[SORT_DEFAULT];
      }

      $scope.newQueryTerm = "";
      updateSearch(opts);
    };

    /**
     * update pagesize. init new search if pagesize increases
     * pagination resets if pageSize changes
     */
    $scope.setPageSize = function(newPageSize){
      console.log('SearchCtrl::setPageSize - current: ' + ss.opts.size + ' , new: ' + newPageSize);
      updateSearch({size: newPageSize, from: 0});
    };

    $scope.setSortMode = function(sortMode) {
      console.log('Changing sort to ' + sortMode.display);
      updateSearch({sort: sortMode, from: 0});
    };

     $scope.setDateRange = function(fromDate, toDate) {
      console.log("fromDate: " + fromDate + ", toDate: " + toDate);
      updateSearch({date: {"gte": fromDate, "lte": toDate}, from: 0});
    };

    /**
     * trigger search to populate new page and update $scope / state
     */
    $scope.setPageNum = function(newPage){
      console.log('SearchCtrl::setPageNum -- calculatePage():' + ss.calculatePage() + ' , newPage: ' + newPage);
      if(ss.calculatePage() !== newPage){
        var newFrom = ss.opts.size * (newPage - 1);
        console.log('SearchCtrl........updating from from: ' + ss.opts.from + ' to: ' + newFrom);
        updateSearch({from: newFrom});
      }
    };

    /**
     * Activate or deactivate a facet. Triggers search update.
     * @param facetOption {object} Facet object
     * @param active {boolean} Set true to activate facet, false to deactivate
     */
    $scope.updateFacet = function(facetOption, active){
      if(active){
        ss.activateFacet(facetOption);
      }
      else{
        ss.deActivateFacet(facetOption);
      }

      //reset pagination when applying facet
      ss.updateOpts({from: 0});
      ss.transitionStateAndSearch();
    };

    /**
     * Toggles facet.active status
     * @param facet {object} Facet object
     */
    $scope.toggleFacet = function(facet){
      $scope.updateFacet(facet, !facet.active);
    };

    /**
     * Removes field from search filters and reruns search.
     * For fields from Advanced Search only.
     * @param field {object} field to remove
     */
    $scope.clearAdvancedField = function(field) {
      var index = $scope.advancedFields.indexOf(field);
      $scope.advancedFields.splice(index, 1);
      updateSearch({advancedFields: $scope.advancedFields, from: 0});
    };

    /**
     * Clear Search Options
     */
    $scope.clearSearchOpts = function(){
      ss.resetOpts();
      ss.transitionStateAndSearch();
    };

    /**
     * Removes query term, then runs search on empty query term string
     */
    $scope.clearQueryTerm = function() {
      $scope.queryTerm = "";
      updateSearch({q:"", from: 0});
    };
    /**
     * Removes date range filter, then runs search again
     */
    $scope.clearDateRange = function() {
      $scope.fromDate = "";
      $scope.toDate = "";
      updateSearch({date: {}, from: 0});
    };
  }
})();
