(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'dataService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService, dataService, result){

      // transition to search result state to trigger search
      $scope.initSearch = function(queryTerm) {
        $state.go('searchResults', {q: queryTerm});
      };

      // parse search result data to simplify object structure
      $scope.parseResults = function(hits){
        return hits.map(function(data){
              var book = data._source;
              // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
              book._id = data._id;
              return book;
        });
      };

      // execute search and handle promise
      $scope.search = function(opts){
        SearchService.search(opts)
          .then(function(results){
            SearchService.setResultsData(results);
            $scope.results = $scope.parseResults(SearchService.hits);
            $scope.totalHits = SearchService.totalHits;
          })
          .catch(function(err){
            console.log('Err - search.controller.js - SearchCtrl - search(): ' + e);
          });
      };

      // results pagination
      $scope.pagination = {
        // set defaults here
        fromPage: SearchService.opts.fromPage || 1,
        pageSize: SearchService.opts.pageSize || 25,
        pageSizeOptions: [10,25,50,100],
      };

      $scope.setPageSize = function(newPageSize){
        SearchService.opts.pageSize = newPageSize;
        // new search if pageSize increases
        if(newPageSize > $scope.pageSize){
        }
        $scope.pagination.pageSize = newPageSize;
      }

      //TODO: Change this to use a $watch / $on, or to watch SearchService for a new search on a URL change instead of or in addition to $stateChangeSuccess.
      //That way, we can get rid of $scope.search as our watcher will execute code below on each  new search whether it involved a state change or not.

      // initialize search results, etc, once state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $scope.queryTerm = SearchService.opts.q;
        SearchService.response
          .then(function(results){
            SearchService.setResultsData(results);
            $scope.results = $scope.parseResults(SearchService.hits);
            $scope.totalHits = SearchService.totalHits;
          })
          .catch(function(err){
            console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
          });
      });

    };

})();

