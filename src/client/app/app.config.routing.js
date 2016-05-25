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
        url: '/search?q&from&size&sort&creator&grp_contributor&language&subject&date_gte&date_lte&adv_creator&adv_date&adv_grp_contributor&adv_language&adv_subject&adv_title',
        controller: 'SearchCtrl',
        templateUrl: config.app.root + '/search/search.results.html',
        params: {
          q: { array: true},
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
          searchResults: function($stateParams, SearchService, SORT_MODES, ADVANCED_SEARCH){
            console.log('Router - SearchResults - in Resolve - $stateParams: ' + JSON.stringify($stateParams));
            var ss = SearchService;
            var opts = ss.getDefaultOptsObj();

            opts.size = parseInt($stateParams.size);
            opts.from = parseInt($stateParams.from);
            opts.sort = $stateParams.sort;
            opts.date.gte = $stateParams.date_gte;
            opts.date.lte = $stateParams.date_lte;

            opts.q = [];
            if ($stateParams.q) {
              var seen = {};
              opts.q = $stateParams.q.filter(function(query){
                if (seen[query]) {
                  return false;
                } else {
                  seen[query] = true;
                  return true;
                }
              });
            }

            // build opts for facet options
            ss.facetCategoriesList.forEach(function(category){
              if($stateParams[category] && $stateParams[category].length){
                $stateParams[category].forEach(function(facetVal){
                  var newFacet = ss.buildFacet(category, facetVal, 0, true);
                  if(newFacet){
                    opts.facets.push(newFacet);
                  }
                });
              }
            });

            // build opts for advanced fields
            ss.advancedFieldsList.forEach(function(name){
              var props = ADVANCED_SEARCH[name];
              var paramValues = $stateParams[props.paramName];
              if(paramValues){
                paramValues.forEach(function(paramVal){
                  var newAdvField = ss.buildAdvancedField(props, paramVal);
                  if(newAdvField){
                    opts.advancedFields.push(newAdvField);
                  }
                });
              }
            });


            console.log('Router - SearchResults - in Resolve - opts: ' + JSON.stringify(opts));
            ss.opts = opts;
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
        //controller: 'FaqsCtrl'
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
