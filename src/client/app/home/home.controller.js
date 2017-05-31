(function() {
  'use strict';

  angular
  .module('app.home')
  .controller('HomePageCtrl', ['$scope', 'SearchService', '$state', 'SORT_MODES', 'SORT_DEFAULT', 'config', HomePageCtrl]);

  function HomePageCtrl($scope, SearchService, $state, SORT_MODES, SORT_DEFAULT, config, NEW_CONTRIBUTORS) {
    $scope.totalTitles = config.numTotalTitles;
    $scope.contributors = config.newContributors;
    $scope.lastUpdatedDate = config.lastUpdatedDate;

    $scope.newSearch =  newSearch;
    $scope.mostRecentSearch = mostRecentSearch;
    $scope.showSpinner = false;
    $scope.queryTerms = SearchService.opts.q;

    function splitQuotedQueries(query){
      var quotedTerms = query.match(/".*?"/g);
      var replace = query.replace(/".*?"/g, " ");
      var replaceArray = replace.split(" ").filter(Boolean);
      var mergedArrays = replaceArray.concat(quotedTerms);
      return mergedArrays;
    }
    
    function newSearch(opts) {
      SearchService.resetOpts();
      if (opts.q) {
        $scope.queryTerms = [];
        var distinctQueries = splitQuotedQueries(opts.q);
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
      SearchService.updateOpts(opts);
      SearchService.transitionStateAndSearch();
      $scope.showSpinner = true;
    };


    function mostRecentSearch(){
      SearchService.resetOpts();
      SearchService.updateOpts({sort: SORT_MODES.date_added, from: 0});
      SearchService.transitionStateAndSearch();
      $scope.showSpinner = true;
    }
  }
})();
