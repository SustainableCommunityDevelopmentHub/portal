(function() {
  'use strict';

  angular
    .module('app.saved-records')
    .controller('SavedRecordsCtrl', ['$scope', '$state', 'records', 'searches', 'SavedRecordsService', 'SearchService', 'SAVED_RECORDS_SORT', '_', SavedRecordsCtrl]);

  function SavedRecordsCtrl($scope, $state, records, searches, SavedRecordsService, SearchService, SAVED_RECORDS_SORT, _) {
    $scope.savedRecords = records;
    $scope.savedSearches = searches;

    $scope.numRecords = $scope.savedRecords.length;

    $scope.currentSort = "";
    $scope.currentPage = 1;

    $scope.recordsActive = true;
    $scope.searchesActive = false;

    $scope.validSortModes = SAVED_RECORDS_SORT;

    /**
     * Sets which tab is the 'active' tab
     * @param tab
     */
    $scope.setActiveTab = function(tab) {
      if (tab === 'records') {
        $scope.recordsActive = true;
        $scope.searchesActive = false;
      } else {
        $scope.recordsActive = false;
        $scope.searchesActive = true;
      }
    };

    /**
     * Updates scope variables
     */
    $scope.refresh = function() {
      $scope.savedRecords = SavedRecordsService.getRecords();
      $scope.numRecords = $scope.savedRecords.length;
    };

    /**
     * Sort records according to sort mode
     * @param sortMode
     */
    $scope.sortRecords = function(sortMode) {
      var sortFunction;
      switch(sortMode.mode) {
        case SAVED_RECORDS_SORT.titleAZ.mode:
          sortFunction = function(a, b) {
            if(a._title_display < b._title_display) return -1;
            if(a._title_display > b._title_display) return 1;
            return 0;
          };
          $scope.currentSort = SAVED_RECORDS_SORT.titleAZ.display;
          break;
        case SAVED_RECORDS_SORT.titleZA.mode:
          sortFunction = function(a, b) {
            if(a._title_display > b._title_display) return -1;
            if(a._title_display < b._title_display) return 1;
            return 0;
          };
          $scope.currentSort = SAVED_RECORDS_SORT.titleZA.display;
          break;
        case SAVED_RECORDS_SORT.dateAdded.mode:
          sortFunction = function(a, b) {
            if(a._ingest_date < b._ingest_date) return -1;
            if(a._ingest_date > b._ingest_date) return 1;
            return a._title_display < b._title_display ? -1 : 1;
          };
          $scope.currentSort = SAVED_RECORDS_SORT.dateAdded.display;
          break;
        case SAVED_RECORDS_SORT.dateAscend.mode:
          sortFunction = function(a, b) {
            if(a._date_facet < b._date_facet) return -1;
            if(a._date_facet > b._date_facet) return 1;
            return 0;
          };
          $scope.currentSort = SAVED_RECORDS_SORT.dateAscend.display;
          break;
        case SAVED_RECORDS_SORT.dateDesc.mode:
          sortFunction = function(a, b) {
            if(a._date_facet > b._date_facet) return -1;
            if(a._date_facet < b._date_facet) return 1;
            return 0;
          };
          $scope.currentSort = SAVED_RECORDS_SORT.dateDesc.display;
      }
      $scope.currentPage = 1;
      $scope.savedRecords = $scope.savedRecords.sort(sortFunction);
    };


    /**
     * Removes search item from search list
     * @param search
     */
    $scope.removeSearch = function(search) {
      var removed = {
        opts: search.opts,
        numResults: search.numResults,
        time: search.time
      };
      SavedRecordsService.removeSearch(removed);
      $scope.savedSearches = SavedRecordsService.getSearches();
    };

    /**
     * Executes search
     * @param search {object}
     */
    $scope.runSearch = function(search) {
      SearchService.updateOpts(search.opts);
      $state.go('searchResults', SearchService.opts);
    };

  }
})();