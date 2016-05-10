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
            SearchService.resetOpts();
            return SearchService.executeSearch().then(function(data) {
              return SearchService.setResultsData(data);
            });
          }
        }
      })

      .state('searchResults', {
        url: '/search?q&from&size&sort&creator&grp_contributor&language&subject&date_gte&date_lte&adv_creator&adv_grp_contributor&adv_language&adv_subject&adv_date&adv_title',
        controller: 'SearchCtrl',
        templateUrl: config.app.root + '/search/search.results.html',
        params: {
          // facet options
          creator: { array: true },
          grp_contributor: { array: true },
          language: { array: true },
          subject: { array: true },
          // advanced fields
          adv_creator: { array: true },
          adv_grp_contributor: { array: true },
          adv_language: { array: true },
          adv_subject: { array: true },
          adv_date: { array: true },
          adv_title: { array: true }
        },
        resolve: {
          searchResults: function($stateParams, SearchService, SORT_MODES){
            console.log('Router - SearchResults - in Resolve');
            var ss = SearchService;
            console.log('Router - SearchResults - from URL, SearchService.opts: ' + JSON.stringify(ss.opts));
            ss.resetOpts();
            console.log('Router - SearchResults - just reset opts, SearchService.opts: ' + JSON.stringify(ss.opts));

            var searchOpts = {
              q: $stateParams.q,
              size: parseInt($stateParams.size),
              from: parseInt($stateParams.from),
              sort: SORT_MODES[$stateParams.sort],
              advancedFields: [],
              date: {
                gte: $stateParams.date_gte || null,
                lte: $stateParams.date_lte || null
              }
            };

            // build opts for facet options
            ss.facetCategoriesList.forEach(function(category){
              if($stateParams[category] && $stateParams[category].length){
                $stateParams[category].forEach(function(facetVal){
                  var newFacet = ss.buildFacet(category, facetVal, null, true);
                  if(newFacet){
                    ss.activateFacet(newFacet);
                  }
                });
              }
            });

            // build opts for advanced fields
            ss.advFieldsList.forEach(function(field){
              var paramName = 'adv_' + field;
              if($stateParams[paramName]){
                $stateParams[paramName].forEach(function(value){
                  var advField = ss.buildAdvancedField(field, value);
                  if(advField){
                    // TODO: Eventually replace this line with SearchService.addAdvancedField(advField);
                    searchOpts.advancedFields.push(advField);
                  }
                });
              }
            });

            ss.updateOpts(searchOpts);

            return ss.executeSearch().then(function(data) {
              return ss.setResultsData(data);
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
