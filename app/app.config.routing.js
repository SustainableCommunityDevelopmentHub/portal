(function() {
  'use strict';

  angular
    .module('app')
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
          url: '/search?q&from',
          controller: 'SearchCtrl',
          templateUrl: 'search/search.results.html',
          resolve: {
             //Run search and load resulting promise into controller prior to state load
            searchResults: function($stateParams, SearchService){
              console.log('Router....in state searchResults resolve. opts: ');
              return SearchService.newSearch({q: $stateParams.q});
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
          templateUrl: 'contributors/contributors.html',
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

        .state('faq', {
          url: '/faq',
          templateUrl: 'partials/faqs.html',
          controller: 'FaqsCtrl'
        });

        // For nicer URLs w/out '#'. Note: <base> tag required on index.html with html5Mode
        $locationProvider.html5Mode(true);

    }]);
})();
