/* App Module */
(function() {
  'use strict';

  angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'app.env.config',
    'app.core',
    'app.widgets',
    'angularUtils.directives.dirPagination',
    'app.home',
    'app.search',
    'app.saved-records',
    'app.advanced-search',
    'app.controller',
    'app.contributors',
    'app.error',
    'AngularPrint',
    'smoothScroll',
    'ngAnimate'
  ])

  // make lodash injectable
  .constant('_', window._)

  // app initialization
  .run(runBlock);

  runBlock.$inject = ['$rootScope', '$state', '$stateParams'];
  function runBlock($rootScope, $state, $stateParams){
    // Convenience to access things any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    // assign this here to persist open tabs across stage changes
    $rootScope.$activeTabs = [];

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      var errorObj = {
        error: 'NONEXISTENT_STATE',
        data: {}
      };

      event.preventDefault();
      $state.go('error', {error: errorObj});
    });
  }

})();
