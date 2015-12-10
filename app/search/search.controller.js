(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService, result){
      // initialize search results, etc, when state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        SearchService.response
        .then(function(results){
          console.log('SearchCtrl....state change success.');
          //console.log('..............Results: ' + JSON.stringify(results));

          // set search result data. must do here b/c of promise
          SearchService.setResultsData(results);
          $scope.results = $scope.parseResults(SearchService.hits);
          $scope.totalHits = SearchService.totalHits;

          console.log('SearchCtrl.......pagination.pageSize::' + $scope.pagination.pageSize);
          console.log('SearchService.......pageSize::' + SearchService.opts.pageSize);
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
        });

        console.log('SearchCtrl.....pagination: ' + JSON.stringify($scope.pagination));
      });

      // bind search opts to scope
      $scope.queryTerm = SearchService.opts.q;
      $scope.pagination = {
        fromPage: SearchService.opts.fromPage,
        pageSize: SearchService.opts.pageSize,
        pageSizeOptions: [10,25,50,100]
      };

      /////////////////////////////////
      //Functions
      /////////////////////////////////

      // reload search result state to trigger search
      $scope.initSearch = function(opts) {
        console.log('....initSearch() - opts: ' + JSON.stringify(opts));
        //$state.go($state.current, opts, {reload: true});
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
        SearchService.newSearch(opts)
        .then(function(results){
          SearchService.setResultsData(results);
          $scope.results = $scope.parseResults(SearchService.hits);
          $scope.totalHits = SearchService.totalHits;
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - search(): ' + e);
        });
      };

      $scope.updatePageSize = function(newPageSize){
        console.log('SearchCtrl.....updating page size from: ' + $scope.pagination.pageSize + ' to: ' + newPageSize);
        SearchService.opts.pageSize = newPageSize;
        // new search if pageSize increases
        if(newPageSize > $scope.pageSize){
          //$scope.initSearch(SearchService.opts);
        }
        $scope.pagination.pageSize = newPageSize;
      }

      $scope.setPageNum = function(newPage){
        SearchService.opts.fromPage = newPage;
        $scope.initSearch(SearchService.opts);
      };

    };

})();

