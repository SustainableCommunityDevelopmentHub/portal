(function() {
  'use strict';

  angular
  .module('app.home')
  .controller('HomePageCtrl', ['$scope', 'SearchService', '$state', 'searchResults', 'SORT_MODES', HomePageCtrl]);

  function HomePageCtrl($scope, SearchService, $state, searchResults, SORT_MODES) {
    $scope.totalTitles = searchResults.numTotalHits;

    $scope.newSearch =  newSearch;
    $scope.mostRecentSearch = mostRecentSearch;

    function newSearch(opts) {
      SearchService.resetOpts();
      SearchService.updateOpts(opts);
      SearchService.transitionStateAndSearch();
    }

    function mostRecentSearch(){
      SearchService.resetOpts();
      SearchService.updateOpts({sort: SORT_MODES['date_added'], from: 0});
      SearchService.transitionStateAndSearch();
    }
  }
})();
