(function() {
  'use strict';

  console.log('foo!');
  angular
  .module('app.search', [])
  .controller('Search', '$scope', 'dataService', '$stateParams', Search);

  function Search($scope, dataService, $stateParams) {
    // Execute search query, handle returned promise from dataService
    $scope.search = function() {
      dataService.search($stateParams.queryTerm)
        .then(function(response){
          $scope.results = response;
        })
        .catch(function(err){
          console.log(err.message);
        });
    };

  };

})();
