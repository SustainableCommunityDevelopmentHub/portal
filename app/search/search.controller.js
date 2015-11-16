(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchCtrl', ['$scope', 'SearchService', SearchCtrl]);

    function SearchCtrl($scope, SearchService, result){
      // Set search results
      //$scope.results = results;

      // Initialize things when controller loads
      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        console.log("$stateChangeSuccess --- event, toState, toParams, fromState, fromParams");
        console.log(arguments);
        //console.log('~~~Running $stateChangeSuccess');
        //console.log('~~~Search results: ' + JSON.stringify(SearchService.results));
        SearchService.results
          .then(function(results){
            // Parse result data to only return relevant information on books
            $scope.results = results.hits.hits.map(function(data){
              console.log('~~~~~~~~~~~~~~~~RESULT~~~~~~~~~~~~~~~~~~');
              console.log(JSON.stringify(data));
              var book = data._source;
              // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
              book._id = data._id;
              return book;
            });
          });
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

