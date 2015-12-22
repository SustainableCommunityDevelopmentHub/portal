(function() {
  'use strict';

  angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    // redirect to home by default
    $urlRouterProvider.otherwise('/');

    // assign states to urls
    $stateProvider
    // abstract state used to load other search states
    .state('home', {
      url: '/',
      templateUrl: 'search/search.home.html',
      controller: 'HomePageCtrl'
    })

    .state('searchResults', {
      url: '/search?q&from&size',
      controller: 'SearchCtrl',
      templateUrl: 'search/search.results.html',
      resolve: {
        // run search and load resulting promise into controller prior to state load
        searchResults: function($stateParams, SearchService){
          console.log('Router....in state searchResults resolve. $stateParams: ' + JSON.stringify($stateParams));

          // NOTE: SearchService.opts should always have current opts prior to this step, making below redundant.
          //       May remove later, choosing to keep for now. 12-20-15

          // do this to separate $stateParam prop names from searchOpts prop names
          var searchOpts = {
            q: $stateParams.q,
            size: $stateParams.size,
            from: $stateParams.from
          };

          return SearchService.updateSearch(searchOpts);
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

    // for nicer URLs w/out '#'. Note: <base> tag required on index.html with html5Mode
    $locationProvider.html5Mode(true);
  }]);
})();