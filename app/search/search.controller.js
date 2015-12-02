(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'dataService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService, dataService, result){
      // Transition to search result state to trigger search
      $scope.initSearch = function(queryTerm) {
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

      // Execute search and handle promise
      $scope.search = function(opts){
        SearchService.search(opts)
          .then(function(results){
            $scope.results = $scope.parseResults(results);
          })
          .catch(function(err){
            console.log('Err - search.controller.js - SearchCtrl - search(): ' + e);
          });
      };

      // Initialize search results, etc, once state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $scope.queryTerm = SearchService.opts.q;
        SearchService.results
          .then(function(results){
            $scope.results = $scope.parseResults(results);
          })
          .catch(function(err){
            console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
          });

      });


    };

})();

