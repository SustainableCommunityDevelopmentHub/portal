(function() {
  'use strict';

  angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'config', function($stateProvider, $urlRouterProvider, $locationProvider, config){
    // redirect to home by default
    $urlRouterProvider.otherwise('/');

    // assign states to urls
    $stateProvider
    // abstract state used to load other search states
      .state('home', {
        url: '/',
        templateUrl: config.app.root + '/search/search.home.html',
        controller: 'HomePageCtrl',
        resolve: {
          searchResults: function(SearchService) {
            return SearchService.updateSearch({q: ""}).then(function(data) {
              return SearchService.setResultsData(data);
            });
          }
        }
      })

      .state('searchResults', {
        url: '/search?q&from&size',
        controller: 'SearchCtrl',
        templateUrl: config.app.root + '/search/search.results.html',
        resolve: {
          // run search and load resulting promise into controller prior to state load
          searchResults: function($stateParams, SearchService){
            console.log('Router....in state searchResults resolve. $stateParams: ' + JSON.stringify($stateParams));

            // NOTE: We must pull search opts from stateParams to handle case
            //       where user pastes URL like: http://gettyportal.com?search?q=art&from=20&size=10
            //       into address bar. In this case, SearchService has no opts
            //       and stateParams will grab opts vals from the URL.
            var searchOpts = {
              q: $stateParams.q,
              size: parseInt($stateParams.size),
              from: parseInt($stateParams.from)
            };
            return SearchService.updateSearch(searchOpts).then(function(data) {
              return SearchService.setResultsData(data);
            });
          }
        }
      })

      .state('books', {
        url: '/books/:bookID',
        templateUrl: config.app.root + '/partials/book-detail.html',
        controller: 'BookDetailCtrl',
        resolve: {
          bookData: function($stateParams, DataService) {
            var book = {
              index: 'portal',
              type: 'book',
              id: $stateParams.bookID
            };
            return DataService.getBookData(book).then(function(response) {
              var bookData = response._source;
              bookData._id = response._id;
              return bookData;
            });
          }
        }
      })

      .state('advanced', {
        url: '/advanced',
        templateUrl: config.app.root + '/advanced_search/advanced-search.html',
        controller: 'AdvancedSearchCtrl'
      })

      .state('contributors', {
        url: '/contributors',
        templateUrl: config.app.root + '/contributors/contributors.html',
        controller: 'ContributorsCtrl',
        resolve: {

          contributors: function($stateParams, DataService){
            console.log('Router....in state contributors resolve. $stateParams: ' + JSON.stringify($stateParams));
            return DataService.getContributors();

          }
        }
      })

      .state('feedback', {
        url: '/feedback',
        templateUrl: config.app.root + '/partials/feedback.html',
        controller: 'FeedbackFormCtrl'
      })

      .state('help', {
        url: '/help',
        templateUrl: config.app.root + '/partials/help.html',
        controller: 'SearchHelpCtrl'
      })

      .state('faq', {
        url: '/faq',
        templateUrl: config.app.root + '/partials/faqs.html',
        controller: 'FaqsCtrl'
      })
      .state('savedRecords', {
        url: '/saved',
        templateUrl: config.app.root + '/saved_records/saved-records.html',
        controller: 'SavedRecordsCtrl',
        resolve: {
          records: function($q, SavedRecordsService) {
            return $q.when(SavedRecordsService.getRecords()).then(function(records) {
              return records;
            });
          },
          searches: function($q, SavedRecordsService) {
            return $q.when(SavedRecordsService.getSearches()).then(function(searches){
              return searches;
            });
          }
        }
      });

    // for nicer URLs w/out '#'. Note: <base> tag required on index.html with html5Mode
    $locationProvider.html5Mode(true);
  }]);
})();
