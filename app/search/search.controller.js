(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, SearchService, results){
      // Set search results
      $scope.results = results;

      // Initialize things when controller loads
      $scope.$on('$stateChangeSuccess', function(){
        console.log('~~~Running $stateChangeSuccess');
        console.log('~~~Search results: ' + JSON.stringify(results));
        ////$scope.results = search;
      });


      // Test function for whatever. Modify as needed.
      $scope.test = function() {
        console.log('~~~~~test!');
        //console.log(JSON.stringify($scope.results.hits.hits));
        console.log('SearchService:');
        console.log(JSON.stringify(SearchService.results.hits.hits));
        $scope.results = SearchService.results;
        console.log('~~~~~~~~~~~~$scope:');
        console.log(JSON.stringify($scope.results.hits.hits));
      };
    };
})();

