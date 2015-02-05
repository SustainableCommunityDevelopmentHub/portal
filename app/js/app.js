'use strict';

/* App Module */

var portalApp = angular.module('portalApp', [
  'ngRoute',
  'portalAnimations',
  'portalControllers',
  //'portalFilters',
  'portalServices'
]);

portalApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/search', {
        templateUrl: 'partials/search.html',
        controller: 'SearchCtrl'
      }).
      when('/books/:bookId', {
        templateUrl: 'partials/book-detail.html',
        controller: 'BookDetailCtrl'
      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);
