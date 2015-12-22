/* App Module */
(function() {
  'use strict';

  angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'app.core',
    'app.widgets',
    'angularUtils.directives.dirPagination',
    'app.search',
    'app.controller',
    'app.contributors'
  ])

  // make lodash injectable
  .constant('_', window._)

  .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
    // Convenience to access things any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }]);

})();
