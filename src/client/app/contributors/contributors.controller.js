(function() {
  'use strict';

  angular
  .module('app.contributors')
  .controller('ContributorsCtrl', ['$scope', 'SearchService', 'contributors', ContributorsCtrl]);

  function ContributorsCtrl($scope, SearchService, contributors) {
    var ss = SearchService;
    $scope.institutions = contributors;

    // for when user clicks on records for a particular institution.
    $scope.contribSearch = function(contributor) {
      ss.resetOpts();
      ss.activateFacet( ss.buildFacet('grp_contributor', contributor) );
      ss.transitionStateAndSearch();
    };
  }

})();
