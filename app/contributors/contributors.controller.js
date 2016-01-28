(function() {
  'use strict';

  angular
  .module('app.contributors')
  .controller('ContributorsCtrl', ['$scope', '$state', 'DataService', ContributorsCtrl]);

    function ContributorsCtrl($scope, $state, DataService) {
      //TODO: Handle asynchronously when DataService is updated to call server for data

      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        DataService.getContributors()
          .then(function(contribResults){
            console.log('ContribCtrl....state change success. DataService.contribResults: ' + JSON.stringify(contribResults));

            $scope.buckets = contribResults.aggregations.grp_contributor.buckets;

          });
      });
    }
})();
