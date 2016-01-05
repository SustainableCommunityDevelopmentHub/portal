(function() {
  'use strict';

  angular
  .module('app.search')
  .controller('SearchCtrl', ['$scope', '$state', 'FacetList', 'SearchService', SearchCtrl]);

  function SearchCtrl($scope, $state, FacetList, SearchService){
    /////////////////////////////////
    //Init
    /////////////////////////////////
    var ss = SearchService;

    // initialize search results, etc, when state loads
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

      ss.returnedPromise
        .then(function(results){
          console.log('SearchCtrl....state change success. SearchService.opts: ' + JSON.stringify(ss.opts));
          //console.log('SearchCtrl.... ES query results: ' + JSON.stringify(results, null, 2));


          /////////////////////////////////////////////////////////
          // once search result promise is resolved,
          // update SearchService and scope
          /////////////////////////////////////////////////////////

          // set search result data. must do here b/c of promise
          var searchResults = ss.setResultsData(results);
          $scope.hits = searchResults.hits;
          $scope.numTotalHits = searchResults.numTotalHits;
          $scope.facets = searchResults.facets;

          $scope.activeFacets = [];

          //console.log('SearchCtrl.......$scope.facets.grp_contributing_institution: ' + JSON.stringify($scope.facets.grp_contributing_institution));
          //console.log('SearchCtrl.....ss.setResultsData returned: ' + JSON.stringify(searchResults));

          // bind search opts to scope
          $scope.queryTerm = ss.opts.q;
          $scope.pagination = {
            // must parseInt so is treated as int in code
            page : parseInt(ss.opts.page),
            size : parseInt(ss.opts.size),
            from : parseInt(ss.opts.from)
          };

          console.log('.....$scope.pagination: ' + JSON.stringify($scope.pagination));
          console.log('.....$scope.numTotalHits: ' + $scope.numTotalHits);
          $scope.validPageSizeOptions = $scope.getValidPageSizeOptions($scope.numTotalHits);

          //$scope.facets = [];
          //if(ss.opts.facets){
            //$scope.facets = ss.opts.facets;
          //}

        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + err);
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

    $scope.getValidPageSizeOptions = function (numTotalHits){
      var passedThreshold = false;
      return $scope.allPageSizeOptions
        .filter(function(pageSize){
          // return pageSizeOption 1 greater than numTotalHits,
          // so all hits can be viewed on 1 page.
          if(!passedThreshold && (pageSize >= numTotalHits)){
            passedThreshold = true;
            return pageSize;
          }
          return pageSize <= numTotalHits;
        });
    };

    /**
     * init search on new query term
     */
    $scope.newQuerySearch = function(query){
      console.log('SearchCtrl....$scope.newQuerySearch: ' + query);
      var opts = {
        q: query
      };

      // if new query term or empty string query term, need to reset pagination
      if(!opts.q || !opts.q.length || (opts.q.toLowerCase() !== ss.opts.q.toLowerCase()) ){
        opts.page = 1;
        opts.from = 0;
      }

      updateSearch(opts);
    };

    /**
     * update pagesize. init new search if pagesize increases
     * pagination resets if pageSize changes
     */
    $scope.setPageSize = function(newPageSize){
      console.log('SearchCtrl.....updating page size from: ' + $scope.pagination.size + ' to: ' + newPageSize);
      console.log('SearchCtrl.setPageSize.....reset to page 1');
      updateSearch({size: newPageSize, page: 1, from: 0});
      return;
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

    /**
     * Used to activate or deactivate a facet.Updates $scope / state
     */
    $scope.updateFacets = function(facetOption){
      console.log('SearchCtrl.updateFacets.....facetOption: ' + JSON.stringify(facetOption));
      if(facetOption.active){
        console.log('.....facet has been set');
        $scope.activeFacets.push(facetOption);
      }
      else{
        _.remove($scope.activeFacets, function(aFacet){
          return aFacet.option === facetOption.option;
        });
      }
    };

  };
})();

