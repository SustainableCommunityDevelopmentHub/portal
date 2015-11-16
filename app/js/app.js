/* App Module */
(function() {
  'use strict';

  angular.module('portalApp', [
    'ui.router',
    'app.core',
    'app.debug',
    'app.search',
    'portalAnimations',
    'portalControllers',
    'portalServices'
  ])

  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    // Redirect to home by default
    $urlRouterProvider.otherwise('/');

    // Assign states to urls
    $stateProvider
      // Abstract state used to load other search states
      .state('home', {
        url: '/',
        templateUrl: 'search/search.home.html',
        controller: 'HomePageCtrl'
      })

      .state('searchResults', {
        url: '/search?q',
        controller: 'SearchCtrl',
        templateUrl: 'search/search.results.html'
        , resolve: {
           //Run search and load resulting promise into controller prior to state load
          result: function($stateParams, SearchService){
            return SearchService.search({q: $stateParams.q});
          }
        }
      })

      .state('ProtosearchResults', {
        url: '/protosearch',
        controller: 'SearchCtrl',
        //templateUrl: 'partials/search.results.old.html'
        views: {
          // Main template for searchResults
          '': { templateUrl: 'search/search.results.html'
          },

          // Child views for searchResults
          'facets@searchResults': {
            templateUrl: 'search/search.facets.html'
          },
          'data@searchResults': {
            templateUrl: 'search/search.data.html'
          }
        }
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
        controller: 'FeedbackFormCtrl'
      })

      .state('help', {
        url: '/help',
        templateUrl: 'partials/help.html',
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
