(function() {
  'use strict';

  angular
  .module('app.search')
  .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'SavedRecordsService', 'searchResults', 'SORT_MODES', 'DEFAULTS', 'FACETS', SearchCtrl]);

  function SearchCtrl($scope, $state, SearchService, SavedRecordsService, searchResults, SORT_MODES, DEFAULTS, FACETS){
    /////////////////////////////////
    //Init
    /////////////////////////////////
    var ss = SearchService;

    $scope.hits = searchResults.hits;
    $scope.numTotalHits = searchResults.numTotalHits;
    $scope.facets = searchResults.facets;

    // bind search opts to scope
    $scope.activeFacets = ss.opts.facets || [];
    $scope.advancedFields = ss.opts.advancedFields || [];

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
      page : calculatePage(ss.opts.from, ss.opts.size),
      size : parseInt(ss.opts.size),
      from : parseInt(ss.opts.from)
    };

    $scope.categories = FACETS;

    if(ss.opts.sort){
      $scope.sort = ss.opts.sort.display;
    } else {
      $scope.sort = "Relevance";
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

    /*
     * Current page based on elasticsearch 'from' and 'size' params
     * @param {int} from ES 'from' value
     * @param {int} size ES 'from' value
     * @return {int} the current page
     */
    function calculatePage(from, size) {
      var page = Math.floor(from / size) + 1;
      if (page === 1 && from > 0){
        page = 2;
      }
      return page;
    }

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
      if(opts.page){
        $scope.pagination.page = opts.page;
        delete opts.page;
      }
      // use SearchService.opts as canonical
      ss.updateOpts(opts);
      console.log('SearchCtrl::updateSearch() -- add\'l opts: ' + JSON.stringify(opts));
      console.log('SearchCtrl::updateSearch() -- merged SearchService.opts: ' + JSON.stringify(ss.opts));
      $state.go('searchResults', ss.opts, {reload: true});
    }

    /**
     * Saves current search options to storage
     * @param searchOpts {object} options to save
     * @param results {integer} number of results for search options
     */
    function saveSearch (searchOpts, results) {
      SavedRecordsService.saveSearch(searchOpts, results);
    };


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
    };


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
        opts.page = 1;
        opts.from = DEFAULTS.searchOpts.from;
        opts.sort = { display: "Relevance",
          mode: "relevance"
        };
      }

      $scope.newQueryTerm = "";
      updateSearch(opts);
    };

    /**
     * update pagesize. init new search if pagesize increases
     * pagination resets if pageSize changes
     */
    $scope.setPageSize = function(newPageSize){
      var newPage = calculatePage(ss.opts.from, newPageSize);

      console.log('SearchCtrl.....updating page size from: ' + ss.opts.size + ' to: ' + newPageSize);
      console.log('SearchCtrl.setPageSize.....reset to page 1');
      updateSearch({size: newPageSize, page: newPage});
    };

    $scope.setSortMode = function(sortMode) {
      console.log('Changing sort to ' + sortMode.display);
      updateSearch({sort: sortMode, page: 1, from: 0});
    };

     $scope.setDateRange = function(fromDate, toDate) {
      console.log("fromDate: " + fromDate + ", toDate: " + toDate);
      updateSearch({date: {"gte": fromDate, "lte": toDate}, page: 1, from: 0});
    };

    /**
     * trigger search to populate new page and update $scope / state
     */
    $scope.setPageNum = function(newPage){
      if($scope.pagination.page !== newPage){
        var newFrom;
        if(newPage > $scope.pagination.page){
          newFrom = ss.opts.from + (ss.opts.size * (newPage - $scope.pagination.page));
        } else{
          newFrom = ss.opts.size * (newPage - 1);
        }
        console.log('SearchCtrl........updating pageNum from: ' + $scope.pagination.page + ' to: ' + newPage);
        console.log('SearchCtrl........updating from from: ' + ss.opts.from + ' to: ' + newFrom);
        updateSearch({from: newFrom, page: newPage});
      }
    };

    /**
     * Used to activate or deactivate a facet.Updates $scope / state
     * @param facetOption {object} Facet option object
     * @param active {boolean} Set true to activate facet, false to deactivate
     */
    $scope.updateFacet = function(facetOption, active){
      console.log('SearchCtrl.updateFacet.....facetOption: ' + JSON.stringify(facetOption));
      if(active){
        console.log('.....facet has been set');
        facetOption.active = true;
        console.log($scope.activeFacets);
        _.remove($scope.activeFacets, function(aFacet){
          return aFacet.option === facetOption.option;
        });
        $scope.activeFacets.push(facetOption);



        // remove facet option from facets sidebar once selected
        // we are using the $$hashkey id prop which angular adds...
        // ...to arr elements when ng-repeat is applied.
        //_.remove($scope.facets[facetOption.facet], function(f){
        //if(f.$$hashkey === facetOption.$$hashkey){
        //console.log('Remove facet, hashkeys match. Facet to remove: ' + JSON.stringify(facetOption));
        //return true;
        //}
        //});
      }
      else{
        facetOption.active = false;
        _.remove($scope.activeFacets, function(aFacet){
          return aFacet.option === facetOption.option;
        });
      }
      //reset pagination when applying facet
      updateSearch({facets: $scope.activeFacets, page: 1, from: DEFAULTS.searchOpts.from});
    };

    /**
     * Toggles facet.active status by calling updateFacet
     * @param facet {object} Facet option object
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
      updateSearch({advancedFields: $scope.advancedFields, page: 1, from: 0});
    };

    // clear all, not just facets. TODO: Change name when will not cause conflicts
    $scope.clearFacetsAndUpdate = function(){
      clearActiveFacets();
      updateSearch(_.merge(DEFAULTS.searchOpts, {sort: SORT_MODES[DEFAULTS.searchOpts.sort]}));
    };

    /**
     * Removes query term, then runs search on empty query term string
     */
    $scope.clearQueryTerm = function() {
      $scope.queryTerm = "";
      updateSearch({q:"", page: 1, from: 0});
    };
    /**
     * Removes date range filter, then runs search again
     */
    $scope.clearDateRange = function() {
      $scope.fromDate = "";
      $scope.toDate = "";
      updateSearch({date: {}, page: 1, from: 0});
    };
  }
})();
