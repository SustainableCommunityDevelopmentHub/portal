(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', 'dataService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService, dataService, result){

      // initialize search results, etc, when state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        SearchService.response
          .then(function(results){
            // search result data
            SearchService.setResultsData(results);
            $scope.results = $scope.parseResults(SearchService.hits);
            $scope.totalHits = SearchService.totalHits;
            // search opts
            $scope.queryTerm = SearchService.opts.q;
            //$scope.pagination.fromPage = SearchService.fromPage;
            //$scope.pagination.pageSize = SearchService.pageSize;
          })
          .catch(function(err){
            console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
          });
      });

      // transition to search result state to trigger search
      $scope.initSearch = function(opts) {
        $state.go('searchResults', opts);
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

      $scope.setPageNum = function(newPage){
        SearchService.opts.fromPage = newPage;
        //$scope.initSearch(SearchService.opts);
        console.log('.........New Page Num:' + newPage);
      };

    };

})();

