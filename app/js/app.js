/* App Module */
(function() {
  'use strict';

  angular.module('portalApp', [
    'ui.router',
    'app.core',
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
      .state('search', {
        abstract: true,
        url: '/',
        template: '<ui-view/>',
        controller: function(){}
      })

      // Homepage
      .state('search.home', {
        url: '',
        templateUrl: 'search/search.home.html',
        controller: 'HomePageCtrl'
      })

      .state('search.results', {
        url: 'search?q',
        controller: 'SearchCtrl',
        views: {
          // Main template for searchResults
          '': {
                templateUrl: 'search/search.results.html',
                controller: 'SearchCtrl'
          },

          // Child views for searchResults
          'facets@searchResults': {
            templateUrl: 'search/search.facets.html'
          }
          //'data@searchResults': {
            //templateUrl: 'search/search.data.html'
          //}
        },
        resolve: {
          results: function($stateParams, SearchService){
            console.log('.....Executing resolve on search.results');
            return SearchService.search({q: $stateParams.q});
          }
          //search: function($stateParams, SearchService){
            //return SearchService.search({q: $stateParams.q})
              //.then(function(data){
                //console.log('search.results resolver~~~');
                //console.log('SearchService.opts: ' + JSON.stringify(SearchService.opts));
                ////console.log(JSON.stringify(data));

              //});
          //}
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
