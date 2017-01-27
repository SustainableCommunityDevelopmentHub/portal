(function() {
  'use strict';

  angular
  .module('app.search')
  .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'SavedRecordsService', 'searchResults', 'SORT_MODES', 'DEFAULTS', 'FACETS', 'SORT_DEFAULT', 'ADVANCED_SEARCH', 'config', SearchCtrl]);

  function SearchCtrl($scope, $state, SearchService, SavedRecordsService, searchResults, SORT_MODES, DEFAULTS, FACETS, SORT_DEFAULT, ADVANCED_SEARCH, config){
    /////////////////////////////////
    //Init
    /////////////////////////////////

    var ss = SearchService;

    $scope.isOpenCreator = true;
    $scope.isOpenSubject = true;
    $scope.isOpenLanguage = true;
    $scope.isOpenFrom = true;

    $scope.hits = searchResults.hits;
    $scope.numTotalHits = searchResults.numTotalHits;
    $scope.facets = searchResults.facets;

    // bind search opts to scope
    $scope.activeFacets = ss.opts.facets;
    $scope.advancedFields = ss.opts.advancedFields;

    $scope.fromDate = ss.opts.date.gte;
    $scope.toDate = ss.opts.date.lte;
    $scope.dateRange = ss.opts.date;

    $scope.queryTerms = ss.opts.q;
    $scope.newQueryTerm = "";
    $scope.pagination = {
      // must parseInt so is treated as int in code
      page : ss.calculatePage(),
      size : parseInt(ss.opts.size),
      from : parseInt(ss.opts.from)
    };

    $scope.categories = FACETS;
    $scope.sort = SORT_MODES[ss.opts.sort].display;
    $scope.showSpinner = false;

    console.log('SearchCtrl::$scope.sort: ' + JSON.stringify($scope.sort));
    console.log('SearchCtrl::$scope.pagination: ' + JSON.stringify($scope.pagination));
    console.log('SearchCtrl::$scope.numTotalHits: ' + $scope.numTotalHits);

    $scope.savedRecords = SavedRecordsService.getRecords();

    $scope.bookMarkText = "";
    $scope.showAdvDropDown = SearchService.showAdvDropDown;
    if ($scope.showAdvDropDown) {
        $scope.advDropDownText = "Close";
      } else {
        $scope.advDropDownText = "Advanced Search"
      }
    saveSearch(ss.opts, $scope.numTotalHits);


    /////////////////////////////////
    //Variables
    /////////////////////////////////
    $scope.allPageSizeOptions = [10,25,50,100];
    $scope.validSortModes = SORT_MODES;
    $scope.validPageSizeOptions = getValidPageSizeOptions($scope.numTotalHits);
    $scope.advFields = ADVANCED_SEARCH;
    $scope.selectedAdvField = ADVANCED_SEARCH.title;
    $scope.advSearchTerm = "";
    
    $scope.removeQuotes = function(queryTerm) {
      var queryTermDisplay = queryTerm.replace(/['"]+/g, '');
      return queryTermDisplay;
    }

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
      $scope.showSpinner = true;
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

    function splitQuotedQueries(query){
      var quotedTerms = query.match(/".*?"/g);
      var replace = query.replace(/".*?"/g, " ");
      var replaceArray = replace.split(" ").filter(Boolean);
      var mergedArrays = replaceArray.concat(quotedTerms);
      return mergedArrays;
    }

    $scope.newQuerySearch = function(query){
      if (query) {
        var distinctQueries = splitQuotedQueries(query);
        for (var i = 0; i < distinctQueries.length; i++) {
          if (distinctQueries[i] != null) {
            if ($scope.queryTerms.indexOf(distinctQueries[i]) === -1) {
              $scope.queryTerms.push(distinctQueries[i].toLowerCase());
              $scope.noQuotes = distinctQueries[i].trim().toLowerCase();
            }
          }
        }
      }
      var opts = {
        q: $scope.queryTerms,
        from: 0,
        sort: SORT_MODES[SORT_DEFAULT]
      };
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

    $scope.currentYear = new Date().getFullYear();
    $scope.oldestDate = config.oldestDate;


    /**
     * control formatting of date range boxes
     * while receiving input
     */
    $('.date_box').on('input propertychange paste', function (e) {
      var reg = /^0+/gi;
      if (this.value.match(reg)) {
        this.value = this.value.replace(reg, '');
      }
      if (this.value.length > 4) {
        this.value = this.value.slice(0,4); 
      }
      if(this.value > $scope.currentYear || isNaN(this.value)) {
        this.value = 0;
      }
    });


    /**
     * set parameters for date range slider
     * and tie values to fromDate and toDate
     */
    $scope.dateSlider = {
      min: $scope.fromDate,
      max: $scope.toDate,
      options: {
        id: "drSlider",
        floor: config.oldestDate,
        ceil: new Date().getFullYear(),
        onChange: function(sliderId, modelValue, highValue, pointerType) {
          $scope.fromDate = modelValue;
          $scope.toDate = highValue;
        },
        noSwitching: true,
        minRange: 1,
        pushRange: true,
        hideLimitLabels: true,
        hidePointerLabels: true
      }
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
      $scope.showSpinner = true;
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
      $scope.showSpinner = true;
      var index = ss.opts.advancedFields.indexOf(field);
      ss.opts.advancedFields.splice(index, 1);

      //reset pagination and update search
      ss.updateOpts({advancedFields: ss.opts.advancedFields, from: 0});
      ss.transitionStateAndSearch();
    };

    /**
     * Clear Search Options
     */
    $scope.clearSearchOpts = function(){
      $scope.showSpinner = true;
      ss.resetOpts();
      ss.transitionStateAndSearch();
    };

    /**
     * Removes query term, then runs search on empty query term string
     */
    $scope.clearQueryTerm = function(queryTerm) {
      $scope.showSpinner = true;
      $scope.queryTerms = $scope.queryTerms.filter(function(query) {
        return query !== queryTerm;
      });
      updateSearch({q:$scope.queryTerms, from: 0});
    };
    /**
     * Removes date range filter, then runs search again
     */
    $scope.clearDateRange = function() {
      ss.opts.date = {};
      updateSearch({from: 0});
    };

    $scope.addAdvSearchTerm = function() {
      if ($scope.advSearchTerm) {
        var distinctQueries = splitQuotedQueries($scope.advSearchTerm);
        for (var i = 0; i < distinctQueries.length; i++) {
          if (distinctQueries[i] != null) {
            var newField = ss.buildAdvancedField($scope.selectedAdvField, distinctQueries[i]);
            ss.opts.advancedFields.push(newField);
            ss.opts.from = 0;
            ss.transitionStateAndSearch();
          }
        }
        
      }
    };

    $scope.setSelectedAdvField = function(field) {
      $scope.selectedAdvField = field;
    };

    $scope.toggleAdvDropDown = function() {
      $scope.showAdvDropDown = !$scope.showAdvDropDown;
      SearchService.showAdvDropDown = $scope.showAdvDropDown;
      if ($scope.showAdvDropDown) {
        $scope.advDropDownText = "Close";
      } else {
        $scope.advDropDownText = "Advanced Search"
      }
    };
  }
})();
