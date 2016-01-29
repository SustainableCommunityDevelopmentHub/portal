(function() {
  'use strict';

  angular
  .module('app.contributors')
  .controller('ContributorsCtrl', ['$scope', '$state', 'DataService', 'SearchService', ContributorsCtrl]);

    function ContributorsCtrl($scope, $state, DataService, SearchService) {

      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

        DataService.getContributors()
          .then(function(contribResults){
            console.log('ContribCtrl....state change success. DataService.contribResults: ' + JSON.stringify(contribResults));

            $scope.buckets = contribResults.aggregations.grp_contributor.buckets;

            // for when user clicks on records for a particular institution.
            // changes state to search.results, which will trigger search operation.
            $scope.contribSearch = function(opts) {
              SearchService.resetOpts();

              // convention is to always pass SearchService.opts
              SearchService.updateOpts(opts);
              console.log('~~~contribSearch! opts: ' + JSON.stringify(opts));
              $state.go('searchResults', SearchService.opts);
    };

          });
      });
    }
})();
