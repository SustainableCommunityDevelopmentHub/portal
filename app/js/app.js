/* App Module */
(function() {
  'use strict';

  angular.module('portalApp', [
    'ui.router',
    'portalAnimations',
    'portalControllers',
    'portalServices'
  ])

  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    // Redirect to home by default
    $urlRouterProvider.when('', '/');

    // Assign states to urls
    $stateProvider
      .state('search', {
        url: '/',
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      })
      .state('books', {
        url: '/books/:bookID',
        templateUrl: 'partials/book-detail.html',
        controller: 'BookDetailCtrl'
      })
      .state('advanced', {
        url: '/advanced',
        templateUrl: 'partials/advanced.html',
        controller: 'AdvancedCtrl'
      })
      .state('contributors', {
        url: '/contributors',
        templateUrl: 'partials/contributors.html',
        controller: 'ContributorsCtrl'
      })
      .state('feedback', {
        url: '/feedback',
        templateUrl: 'partials/feedback.html',
        controller: 'FaqsCtrl'
      })
      .state('searchhelp', {
        url: '/searchhelp',
        templateUrl: 'partials/searchhelp.html',
        controller: 'SearchHelpCtrl'
      })
      .state('faqs', {
        url: '/faqs',
        templateUrl: 'partials/faqs.html',
        controller: 'FaqsCtrl'
      });

      // For pretty URLs w/out '#'. Note: <base> tag required with html5Mode
      $locationProvider.html5Mode(true);

  }]);
})();
