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

          $scope.activeFacets = ss.opts.facets || [];

          //console.log('SearchCtrl.......$scope.facets.grp_contributor: ' + JSON.stringify($scope.facets.grp_contributor));
          //console.log('SearchCtrl.....ss.setResultsData returned: ' + JSON.stringify(searchResults));

          // bind search opts to scope
          $scope.queryTerm = ss.opts.q;
          $scope.pagination = {
            // must parseInt so is treated as int in code
            page : parseInt(ss.opts.page),
            size : parseInt(ss.opts.size),
            from : parseInt(ss.opts.from)
          };
          if(ss.opts.sort){
            $scope.sort = ss.opts.sort.display;
          } else {
            $scope.sort = "Relevance";
          }
          console.log('.....$scope.pagination: ' + JSON.stringify($scope.pagination));
          console.log('.....$scope.numTotalHits: ' + $scope.numTotalHits);
          $scope.validPageSizeOptions = $scope.getValidPageSizeOptions($scope.numTotalHits);

          if(ss.opts.facets){
            $scope.activeFacets = ss.opts.facets;
          }

        })
        .catch(function(err){
          console.log('Err - search.controller.js - SearchCtrl - on $stateChangeSuccess: ' + err);
        });
    });

    /////////////////////////////////
    //Variables
    /////////////////////////////////
    $scope.allPageSizeOptions = [10,25,50,100];
    $scope.validSortModes = {
            relevance : {
              display: "Relevance",
              mode: "relevance"
            },
            dateAdded : {
              display: "Newly Added First",
              mode: "date_added"
            },
            titleAZ : {
              display: "Title: A-Z",
              mode: "title_asc"
            },
            titleZA : {
              display: "Title: Z-A",
              mode: "title_desc"
            },
            dateAscend : {
              display: "Date (ascending)",
              mode: "date_asc"
            },
            dateDesc : {
              display: "Date (descending)",
              mode: "date_desc"
            }
        };


    ///////////////////////////
    //Private/Helper Functions
    ///////////////////////////

    /**
     * Clear all active facets from controller. Does not update SearchService or retrigger search.
     * Should always run updateSearch() w/new facet opts after executing this function.
     */
    function clearActiveFacets(){
      // need to do this so facets don't reset themselves
      $scope.activeFacets.forEach(function(facet){
        facet.active = false;
      });
      $scope.activeFacets = [];
    }

    /**
     * reload search result state to trigger search.
     * if no opts passed uses SearchService.opts.
     */
    function updateSearch(opts) {
      // use SearchService.opts as canonical
      ss.updateOpts(opts);
      console.log('SearchCtrl....updateSearch() - add\'l opts: ' + JSON.stringify(opts));
      console.log('search.controller.updateSearch........merged SearchService.opts: ' + JSON.stringify(ss.opts));
      $state.go('searchResults', ss.opts, {reload: true});
    }

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
      if(!opts.q || (opts.q !== ss.opts.q) ){
        opts.page = 1;
        opts.from = 0;
        opts.sort = { display: "Relevance",
                      mode: "relevance"
                    };
      }

      // we want to clear active facets when user queries on new term
      clearActiveFacets();
      opts.facets = [];

      updateSearch(opts);
    };

    /**
     * update pagesize. init new search if pagesize increases
     * pagination resets if pageSize changes
     */
    $scope.setPageSize = function(newPageSize){
      var newPage = Math.floor(ss.opts.from / newPageSize) + 1;
      if (newPage === 1 && ss.opts.from > 0){
        newPage = 2;
      }
      console.log('SearchCtrl.....updating page size from: ' + ss.opts.size + ' to: ' + newPageSize);
      console.log('SearchCtrl.setPageSize.....reset to page 1');
      updateSearch({size: newPageSize, page: newPage});
      return;
    };

    $scope.setSortMode = function(sortMode) {
      console.log('Changing sort to ' + sortMode.display);
      updateSearch({sort: sortMode, page: 1, from: 0});
      return;
    };

    /**
     * trigger search to populate new page and update $scope / state
     */
    $scope.setPageNum = function(newPage){
      if(ss.opts.page !== newPage){
        var newFrom;
        if(newPage > ss.opts.page){
          newFrom = ss.opts.from + (ss.opts.size * (newPage - ss.opts.page));
        } else{
          newFrom = ss.opts.size * (newPage - 1);
        }
        console.log('SearchCtrl........updating pageNum from: ' + ss.opts.page + ' to: ' + newPage);
        console.log('SearchCtrl........updating from from: ' + ss.opts.from + ' to: ' + newFrom);
        updateSearch({from: newFrom, page: newPage});
      }
    };

    /**
     * Used to activate or deactivate a facet.Updates $scope / state
     * @param facetOption {object} Facet option object
     * @param active {boolean} Set true to activate facet, false to deactivate
     */
    $scope.updateFacet = function(facetOption, active){
      console.log('SearchCtrl.updateFacet.....facetOption: ' + JSON.stringify(facetOption));
      if(active){
        console.log('.....facet has been set');
        facetOption.active = true;
        console.log($scope.activeFacets);
        _.remove($scope.activeFacets, function(aFacet){
          return aFacet.option === facetOption.option;
        });
        $scope.activeFacets.push(facetOption);
        
        

        // remove facet option from facets sidebar once selected
        // we are using the $$hashkey id prop which angular adds...
        // ...to arr elements when ng-repeat is applied.
        //_.remove($scope.facets[facetOption.facet], function(f){
          //if(f.$$hashkey === facetOption.$$hashkey){
            //console.log('Remove facet, hashkeys match. Facet to remove: ' + JSON.stringify(facetOption));
            //return true;
          //}
        //});
      }
      else{
        facetOption.active = false;
        _.remove($scope.activeFacets, function(aFacet){
          return aFacet.option === facetOption.option;
        });
      }
      //Setting page num to 1 to reset pagination
      updateSearch({facets: $scope.activeFacets, page: 1, from: 0});
    };

    $scope.clearFacetsAndUpdate = function(){
      clearActiveFacets();
      updateSearch({facets: []});
    };

  }

})();

