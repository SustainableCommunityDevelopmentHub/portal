(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService, result){

      // Transition to new search state to trigger search
      $scope.initSearch = function(queryTerm) {
        console.log('~~~initSearch! queryTerm: ' + queryTerm);
        $state.go('searchResults', {q: queryTerm});
      };

      // Parse search result data to simplify object structure
      $scope.parseResults = function(results){
        return results.hits.hits.map(function(data){
              var book = data._source;
              // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
              book._id = data._id;
              return book;
        });
      };

      $scope.search = function(opts){
        SearchService.search(opts)
          .then(function(results){
            $scope.results = $scope.parseResults(results);
          });
      };

      // Initialize search results, etc, once state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $scope.queryTerm = SearchService.opts.q;
        SearchService.results
          .then(function(results){
            $scope.results = $scope.parseResults(results);
          });
      });

    };

})();

