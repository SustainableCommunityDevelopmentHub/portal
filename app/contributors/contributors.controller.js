(function() {
  'use strict';

  angular
    .module('app.contributors')
    .controller('ContributorsCtrl', ['$scope', 'dataService', ContributorsCtrl]);

    function ContributorsCtrl($scope, dataService) {
      //TODO: Handle asynchronously when dataService is updated to call server for data
      $scope.contributors = dataService.getContributors();
    };
})();
