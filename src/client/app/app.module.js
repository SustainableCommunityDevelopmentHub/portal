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
    'AngularPrint',
    'smoothScroll',
    'ngAnimate'
  ])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  }])

  // make lodash injectable
  .constant('_', window._)

  .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
    // Convenience to access things any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // assign this here to persist open tabs across stage changes
    $rootScope.$activeTabs = [];
  }]);

})();
