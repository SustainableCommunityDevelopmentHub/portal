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
        url: '/search?q&from&size&sort&creator&grp_contributor&language&subject&type&date_lte&date_gte',
        controller: 'SearchCtrl',
        templateUrl: config.app.root + '/search/search.results.html',
        params: {
          creator: { array: true },
          grp_contributor: { array: true },
          language: { array: true },
          subject: { array: true },
          type: { array: true }
        },
        resolve: {
          searchResults: function($stateParams, SearchService, SORT_MODES){
            var searchOpts = {
              q: $stateParams.q,
              size: parseInt($stateParams.size),
              from: parseInt($stateParams.from),
              sort: SORT_MODES[$stateParams.sort]
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
