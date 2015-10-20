'use strict';

/* App Module */

var portalApp = angular.module('portalApp', [
  'ngRoute',
  'portalAnimations',
  'portalControllers',
  'portalServices'
]);

portalApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/advanced', {
        templateUrl: 'partials/advanced.html',
        controller: 'AdvancedCtrl'
      }).
      when('/books/:bookID', {
        templateUrl: 'partials/book-detail.html',
        controller: 'BookDetailCtrl'
      }).
      when('/searchhelp', {
        templateUrl: 'partials/searchhelp.html',
        controller: 'SearchHelpCtrl'
      }).
      when('/faqs', {
        templateUrl: 'partials/faqs.html',
        controller: 'FaqsCtrl'
      }).
      when('/feedback', {
        templateUrl: 'partials/feedback.html',
        controller: 'FaqsCtrl'
      }).
      when('/contributors', {
        templateUrl: 'partials/contributors.html',
        controller: 'ContributorsCtrl'
      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);
