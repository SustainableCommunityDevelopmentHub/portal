(function() {
  'use strict';

  angular
    .module('app.contributors')
    .controller('ContributorsCtrl', ['$scope', 'DataService', ContributorsCtrl]);

    function ContributorsCtrl($scope, DataService) {
      //TODO: Handle asynchronously when DataService is updated to call server for data
      $scope.contributors = DataService.getContributors();
    };
})();
