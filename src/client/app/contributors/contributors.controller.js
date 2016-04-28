(function() {
  'use strict';

  angular
  .module('app.contributors')
  .controller('ContributorsCtrl', ['$scope', '$state', 'DataService', 'SearchService', ContributorsCtrl]);

  function ContributorsCtrl($scope, $state, DataService, SearchService) {
    var ss = SearchService;

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if(toState.controller === 'ContributorsCtrl'){
        DataService.getContributors()
          .then(function(contribResults){

            console.log('ContribCtrl....state change success. DataService.contribResults: ' + JSON.stringify(contribResults));

            $scope.institutions = contribResults.aggregations.grp_contributor.buckets;

          });
      }
    });

    // for when user clicks on records for a particular institution.
    $scope.contribSearch = function(contributor) {
      ss.resetOpts();
      ss.activateFacet( ss.buildFacet('grp_contributor', contributor) );
      ss.transitionStateAndSearch();
    };

  }

})();
