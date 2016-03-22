(function() {
  'use strict';

  angular
    .module('app.saved-records')
    .controller('SavedRecordsCtrl', ['$scope', '$state', 'records', 'searches', 'SavedRecordsService', 'StorageService', 'SearchService', 'DEFAULTS', 'SORT_MODES', '_', SavedRecordsCtrl]);

  function SavedRecordsCtrl($scope, $state, records, searches, SavedRecordsService, StorageService, SearchService, DEFAULTS, SORT_MODES, _) {
    $scope.savedRecords = records;
    $scope.savedSearches = searches;

    $scope.numRecords = $scope.savedRecords.length;

    $scope.currentSort = "";
    $scope.currentPage = 1;

    $scope.recordsActive = true;
    $scope.searchesActive = false;

    $scope.validSortModes = {
      dateAdded : {
        display: "Newly Added First",
        mode: "date_added"
      },
      titleAZ : {
        display: "Title: A-Z",
        mode: "title_asc"
      },
      titleZA : {
        display: "Title: Z-A",
        mode: "title_desc"
      },
      dateAscend : {
        display: "Date (ascending)",
        mode: "date_asc"
      },
      dateDesc : {
        display: "Date (descending)",
        mode: "date_desc"
      }};

    $scope.setActiveTab = function(tab) {
      if (tab === 'records') {
        $scope.recordsActive = true;
        $scope.searchesActive = false;
      } else {
        $scope.recordsActive = false;
        $scope.searchesActive = true;
      }
    };

    $scope.refresh = function() {
      console.log("refresh saved records!");
      $scope.savedRecords = SavedRecordsService.getRecords();
      $scope.numRecords = $scope.savedRecords.length;
      console.log($scope.savedRecords);
    };

    $scope.sortRecords = function(sortMode) {
      var sortFunction;
      switch(sortMode.mode) {
        case SORT_MODES.titleAZ.mode:
          sortFunction = function(a, b) {
            if(a._title_display < b._title_display) return -1;
            if(a._title_display > b._title_display) return 1;
            return 0;
          };
          $scope.currentSort = SORT_MODES.titleAZ.display;
          break;
        case SORT_MODES.titleZA.mode:
          sortFunction = function(a, b) {
            if(a._title_display > b._title_display) return -1;
            if(a._title_display < b._title_display) return 1;
            return 0;
          };
          $scope.currentSort = SORT_MODES.titleZA.display;
          break;
        case SORT_MODES.dateAdded.mode:
          sortFunction = function(a, b) {
            if(a._ingest_date < b._ingest_date) return -1;
            if(a._ingest_date > b._ingest_date) return 1;
            return a._title_display < b._title_display ? -1 : 1;
          };
          $scope.currentSort = SORT_MODES.dateAdded.display;
          break;
        case SORT_MODES.dateAscend.mode:
          sortFunction = function(a, b) {
            if(a._date_facet < b._date_facet) return -1;
            if(a._date_facet > b._date_facet) return 1;
            return 0;
          };
          $scope.currentSort = SORT_MODES.dateAscend.display;
          break;
        case SORT_MODES.dateDesc.mode:
          sortFunction = function(a, b) {
            if(a._date_facet > b._date_facet) return -1;
            if(a._date_facet < b._date_facet) return 1;
            return 0;
          };
          $scope.currentSort = SORT_MODES.dateDesc.display;
      }
      $scope.currentPage = 1;
      $scope.savedRecords = $scope.savedRecords.sort(sortFunction);

      console.log($scope.savedRecords);
    };

    $scope.removeSearch = function(search) {
      console.log(search);
      var removed = {
        opts: search.opts,
        numResults: search.numResults,
        time: search.time
      };
      SavedRecordsService.removeSearch(removed);
      $scope.savedSearches = SavedRecordsService.getSearches();
    };

    $scope.runSearch = function(search) {
      SearchService.updateOpts(search.opts);
      console.log();
      $state.go('searchResults', SearchService.opts);
    };

    $scope.changePage = function(page) {
      console.log("Changing page to: " + page);
    };

  }
})();