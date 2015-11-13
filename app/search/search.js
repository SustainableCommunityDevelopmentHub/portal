(function() {
  'use strict';

  console.log('foo!');
  angular
  .module('app.search', [])
  .controller('Search', '$scope', 'searchService', '$stateParams', Search);

  function Search($scope, searchService, $stateParams) {
    // Execute search query, handle returned promise from dataService
    $scope.search = function() {
      searchService.search({q: $stateParams.queryTerm})
        .catch(function(err){
          console.log(err.message);
        });
    };

  };

})();
