(function() {
  'use strict';

  angular
  .module('app.search')
  .controller('SearchCtrl', ['$scope', '$state', 'SearchService', SearchCtrl]);

  function SearchCtrl($scope, $state, SearchService){
    /////////////////////////////////
    //Init
    /////////////////////////////////
    var ss = SearchService;

    // initialize search results, etc, when state loads
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

      ss.response
        .then(function(results){
          console.log('SearchCtrl....state change success. SearchService.opts: ' + JSON.stringify(ss.opts));

          // once search result promise is resolved,
          // update SearchService and scope with new search values.
          // set search result data. must do here b/c of promise
          ss.setResultsData(results);
          $scope.results = parseResults(ss.hits);
          $scope.totalHits = ss.totalHits;

          // bind search opts to scope
          $scope.queryTerm = ss.opts.q;
          $scope.pagination = {
            // must parseInt so is treated as int in code
            page : parseInt(ss.opts.page),
            size : parseInt(ss.opts.size),
            from : parseInt(ss.opts.from)
          };

          console.log('.....$scope.pagination: ' + JSON.stringify($scope.pagination));
          console.log('.....$scope.totalHits: ' + $scope.totalHits);
          $scope.validPageSizeOptions = $scope.getValidPageSizeOptions($scope.totalHits);
        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + e);
        });
    });

    /////////////////////////////////
    //Variables
    /////////////////////////////////
    $scope.allPageSizeOptions = [10,25,50,100];


    ///////////////////////////
    //Private/Helper Functions
    ///////////////////////////

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

    /**
     * reload search result state to trigger search.
     * if no opts passed uses SearchService.opts.
     */
    function updateSearch(opts) {
      // use SearchService.opts as canonical
      ss.updateOpts(opts);
      console.log('SearchCtrl....updateSearch() - add\'l opts: ' + JSON.stringify(opts));
      console.log('search.controller.updateSearch........merged SearchService.opts: ' + JSON.stringify(ss.opts));
      $state.go('searchResults', ss.opts);
    };

    /////////////////////////////////
    //Functions
    /////////////////////////////////

    $scope.getValidPageSizeOptions = function (totalHits){
      var passedThreshold = false;
      return $scope.allPageSizeOptions
        .filter(function(pageSize){
          // return pageSizeOption 1 greater than totalHits,
          // so all hits can be viewed on 1 page.
          if(!passedThreshold && (pageSize >= totalHits)){
            passedThreshold = true;
            return pageSize;
          }
          return pageSize <= totalHits;
        });
    };

    /**
     * init search on new query term
     */
    $scope.newQuerySearch = function(query){
      var opts = {
        q: query
      };

      // if new query term, need to reset pagination
      if(opts.q.toLowerCase() !== ss.opts.q.toLowerCase()){
        opts.page = 1;
      }

      updateSearch(opts);
    };

    /**
     * update pagesize. init new search if pagesize increases
     */
    $scope.setPageSize = function(newPageSize){
      console.log('SearchCtrl.....updating page size from: ' + $scope.pagination.size + ' to: ' + newPageSize);
      ss.updateOpts({pageSize: newPageSize});

      //if(newPageSize > $scope.pagination.size){
        updateSearch({size: newPageSize});
        return;
      //}

      //$scope.pagination.size = newPageSize;
    }

    /**
     * trigger search to populate new page and update $scope / state
     */
    $scope.setPageNum = function(newPage){
      if(ss.page !== newPage){
        var newFrom = ss.opts.size * (newPage - 1);
        console.log('SearchCtrl........updating pageNum from: ' + $scope.pagination.page + ' to: ' + newPage);
        console.log('SearchCtrl........updating from from: ' + ss.opts.from + ' to: ' + newFrom);
        updateSearch({from: newFrom, page: newPage});
      }
    };

  };
})();

