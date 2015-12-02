/* App Module */
(function() {
  'use strict';

  angular.module('app', [
    'ui.router',
    'app.core',
    'app.widgets',
    'angularUtils.directives.dirPagination',
    'app.search',
    'app.controller',
    'app.contributors'
  ])

  .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
    // Convience to access $state, $stateParams from any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }]);

})();
