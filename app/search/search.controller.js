(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService){
      // initialize search results, etc, when state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        SearchService.response
        .then(function(results){
          console.log('SearchCtrl....state change success.');
          handleSearchResults(results);
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
        });
      });

      // set initial scope vals
      $scope.queryTerm = SearchService.opts.q;
      $scope.page =  SearchService.opts.page;
      $scope.pageSize =  SearchService.opts.pageSize;
      $scope.allPageSizeOptions = [10,25,50,100];

      ///////////////////////////
      //Private/Helper Functions
      ///////////////////////////

      // once search result promise is resolved, 
      // update SearchService and scope with new search values.
      function handleSearchResults(results){
        // set search result data. must do here b/c of promise
        SearchService.setResultsData(results);
        $scope.results = parseResults(SearchService.hits);
        $scope.totalHits = SearchService.totalHits;

        // bind search opts to scope
        $scope.queryTerm = SearchService.opts.q;
        $scope.page = SearchService.opts.page;
        $scope.pageSize = SearchService.opts.pageSize;
        $scope.validPageSizeOptions = $scope.getValidPageSizeOptions($scope.totalHits);
      };

      // parse search result data to simplify object structure
       function parseResults(hits){
        return hits.map(function(data){
          var book = data._source;
          // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
          book._id = data._id;
          return book;
        });
      };

      $scope.getValidPageSizeOptions = function (totalHits){
        return $scope.allPageSizeOptions
          .filter(function(pageSize){
            return pageSize <= totalHits;
          });
      };

      /////////////////////////////////
      //Functions
      /////////////////////////////////

      // reload search result state to trigger search.
      // if no opts passed uses SearchService.opts.
      $scope.updateSearch = function(opts) {
        opts = opts || SearchService.opts;
        console.log('SearchCtrl....updateSearch() - add\'l opts: ' + JSON.stringify(opts));
        SearchService.updateSearch(opts)
          .then(handleSearchResults);
      };

      // execute search and handle promise
      $scope.search = function(opts){
        SearchService.newSearch(opts)
        .then(function(results){
          SearchService.setResultsData(results);
          $scope.results = parseResults(SearchService.hits);
          $scope.totalHits = SearchService.totalHits;
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - search(): ' + e);
        });
      };

      $scope.setPageSize = function(newPageSize){
        console.log('SearchCtrl.....updating page size from: ' + $scope.pageSize + ' to: ' + newPageSize);
        SearchService.updateOpts({pageSize: newPageSize});
        // new search if pageSize increases
        if(newPageSize > $scope.pageSize){
          $scope.updateSearch({pageSize: newPageSize});
          return;
        }
        $scope.pageSize = newPageSize;
      }

      // trigger search to populate new page and update $scope / state
      $scope.setPageNum = function(newPage){
        // need if clause bc dir-paginate triggers this unnecessarily sometimes
        if($scope.page != newPage){
          console.log('SearchCtrl........updating pageNum from: ' + $scope.page + ' to: ' + newPage);
          $scope.updateSearch({page: newPage});
        }
      };

    };
})();

