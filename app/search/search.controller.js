(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', '$state', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, $state, SearchService){
      var ss = SearchService;

      // initialize search results, etc, when state loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        ss.response
        .then(function(results){
          console.log('SearchCtrl....state change success.');
          handleSearchResults(results);
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
        });
      });

      ///////////////////////////
      //Private/Helper Functions
      ///////////////////////////

      /**
       * once search result promise is resolved,
       * update SearchService and scope with new search values.
       */
      function handleSearchResults(results){
        // set search result data. must do here b/c of promise
        ss.setResultsData(results);
        $scope.results = parseResults(ss.hits);
        $scope.totalHits = ss.totalHits;

        // bind search opts to scope
        $scope.queryTerm = ss.opts.q;
        $scope.page = ss.opts.page;
        $scope.pageSize = ss.opts.pageSize;
        $scope.validPageSizeOptions = $scope.getValidPageSizeOptions($scope.totalHits);
        console.log('SearchCtrl.handleSearchResults........page: '+ $scope.page);
      };

      /**
       * parse search result data to simplify object structure
       */
       function parseResults(hits){
        return hits.map(function(data){
          var book = data._source;
          // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
          book._id = data._id;
          return book;
        });
      };

      $scope.allPageSizeOptions = [10,25,50,100];

      $scope.getValidPageSizeOptions = function (totalHits){
        return $scope.allPageSizeOptions
          .filter(function(pageSize){
            return pageSize <= totalHits;
          });
      };

      /////////////////////////////////
      //Functions
      /////////////////////////////////

      /**
       * reload search result state to trigger search.
       * if no opts passed uses SearchService.opts.
       */
      $scope.updateSearch = function(opts) {
        // use SearchService.opts as canonical
        ss.updateOpts(opts);
        console.log('SearchCtrl....updateSearch() - add\'l opts: ' + JSON.stringify(opts));
        console.log('search.controller.updateSearch........merged SearchService.opts: ' + JSON.stringify(ss.opts));
        $state.go('searchResults', ss.opts);
        //ss.updateSearch(opts)
          //.then(handleSearchResults);
      };

      $scope.setPageSize = function(newPageSize){
        console.log('SearchCtrl.....updating page size from: ' + $scope.pageSize + ' to: ' + newPageSize);
        ss.updateOpts({pageSize: newPageSize});
        // new search if pageSize increases
        if(newPageSize > $scope.pageSize){
          $scope.updateSearch({pageSize: newPageSize});
          return;
        }
        $scope.pageSize = newPageSize;
      }

      /**
       * trigger search to populate new page and update $scope / state
       */
      $scope.setPageNum = function(newPage){
          console.log('SearchCtrl........updating pageNum from: ' + $scope.page + ' to: ' + newPage);
          $scope.updateSearch({page: newPage});
      };

    };
})();

