/* App Module */
(function() {
  'use strict';

  // import app config settings for api hostname, etc
  // we set these as an angular constant below
  var __env = {};
  if(window){
    Object.assign(__env, window.__env);
  }
  console.log('~~~app.module.js - __env is: ' + JSON.stringify(__env));

  angular.module('app', [
    'ui.router',
    'ui.bootstrap',
    'app.core',
    'app.widgets',
    'angularUtils.directives.dirPagination',
    'app.search',
    'app.saved-records',
    'app.advanced-search',
    'app.controller',
    'app.contributors',
    'AngularPrint',
    'smoothScroll',
    'ngAnimate'
  ])

  .constant('config', __env)


  // make lodash injectable
  .constant('_', window._)

  .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
    // Get app config/env settings from __env variable

    // Convenience to access things any scope w/out injection
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // assign this here to persist open tabs across stage changes
    $rootScope.$activeTabs = [];
  }]);

})();
