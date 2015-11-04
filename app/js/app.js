/* App Module */
(function() {
  'use strict';

  angular.module('portal', [
    'ui.router',
    'portalAnimations',
    'portalControllers',
    'portalServices'
  ])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('search', {
        url: '/search',
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
  }]);
})();
