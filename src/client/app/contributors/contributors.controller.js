(function() {
  'use strict';

  angular
  .module('app.contributors')
  .controller('ContributorsCtrl', ['$scope', 'SearchService', 'contributors', '$http', ContributorsCtrl]);

  function ContributorsCtrl($scope, SearchService, contributors, $http) {
    var ss = SearchService;
    $scope.institutions = contributors;

    // for when user clicks on records for a particular institution.
    $scope.contribSearch = function(contributor) {
      ss.resetOpts();
      ss.activateFacet( ss.buildFacet('grp_contributor', contributor) );
      ss.transitionStateAndSearch();
    };

    // fetches websites from json file, using institutions as keys
    $scope.contribWebsite = function (contributor) {
      $http.get('/app/contributors/contributor_websites.json').success(function(data) {
        $scope.websites = data;
        for (var i = 0; i < $scope.institutions.length; i++) {
          if (contributor == $scope.institutions[i].key) {
            window.location = data[$scope.institutions[i].key];
          }         
        }
      });
    };

  }

})();
