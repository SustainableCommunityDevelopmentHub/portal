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
    'app.book-detail',
    'app.error',
    'AngularPrint',
    'smoothScroll',
    'ngAnimate',
    'angularSpinner'
  ])

  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

  }])

  // make lodash injectable
  .constant('_', window._)

  // turn off angular debug mode for production; improves performance
  .config(['$compileProvider', 'config', function($compileProvider, config){
    if(config.env === 'prod'){
      $compileProvider.debugInfoEnabled(false);
      console.log('In production. Debug mode disabled');
    }
    else{
      console.log('In ' + config.env + '. Debug mode enabled');
    }
  }])
  
  // app initialization
  .run(runBlock);

  runBlock.$inject = ['$rootScope', '$state', '$stateParams'];
  function runBlock($rootScope, $state, $stateParams){
    // Convenience to access things any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    // assign this here to persist open tabs across stage changes
    $rootScope.$activeTabs = [];
    $rootScope.showSpinner = false;

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      event.preventDefault();
      $state.go('error');
    });
  }
})();
