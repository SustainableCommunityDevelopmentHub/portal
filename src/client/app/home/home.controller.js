(function() {
  'use strict';

  angular
  .module('app.home')
  .controller('HomePageCtrl', ['$scope', 'SearchService', '$state', 'SORT_MODES', 'config', 'NEW_CONTRIBUTORS', HomePageCtrl]);

  function HomePageCtrl($scope, SearchService, $state, SORT_MODES, config, NEW_CONTRIBUTORS) {
    $scope.totalTitles = config.numTotalTitles;

    $scope.newSearch =  newSearch;
    $scope.mostRecentSearch = mostRecentSearch;
    $scope.showSpinner = false;
    $scope.contributors = NEW_CONTRIBUTORS;

    function newSearch(opts) {
      SearchService.resetOpts();
      SearchService.updateOpts(opts);
      SearchService.transitionStateAndSearch();
      $scope.showSpinner = true;
    }

    function mostRecentSearch(){
      SearchService.resetOpts();
      SearchService.updateOpts({sort: SORT_MODES.date_added, from: 0});
      SearchService.transitionStateAndSearch();
      $scope.showSpinner = true;
    }
  }
})();
