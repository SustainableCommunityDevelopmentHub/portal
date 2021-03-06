(function() {
  'use strict';

  angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'config', Router]);

  function Router($stateProvider, $urlRouterProvider, $locationProvider, config){
    // redirect to home by default
    $urlRouterProvider.otherwise('/');

    // assign states to urls
    $stateProvider
    // abstract state used to load other search states
      .state('home', {
        url: '/',
        templateUrl: config.app.root + '/home/home.html',
        controller: 'HomePageCtrl'
      })
      .state('searchResults', {
        url: '/search?q&from&size&sort&creator&grp_contributor&language&subject&date_gte&date_lte&adv_creator&adv_date&adv_grp_contributor&adv_language&adv_subject&adv_title&adv_identifier&adv_publisher&adv_format&adv_type&adv_description&adv_provenance&adv_coverage&adv_relation&adv_source&adv_rights&adv_accrualMethod&adv_accrualPeriodicity&adv_audience',
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
          adv_title: { array: true },
          adv_identifier: { array: true },
          adv_publisher: { array: true },
          adv_format: { array: true },
          adv_type: { array: true },
          adv_description: { array: true },
          adv_provenance: { array: true },
          adv_coverage: { array: true },
          adv_relation: { array: true },
          adv_source: { array: true },
          adv_rights: { array: true },
          adv_accrualMethod: { array: true },
          adv_accrualPeriodicity: { array: true },
          adv_audience: { array: true }
        },
        resolve: {
          searchResults: function($rootScope, $stateParams, SearchService, DataService, SORT_MODES, ADVANCED_SEARCH){
            $rootScope.showSpinner = true;
            console.log('Router - SearchResults - in Resolve - $stateParams: ' + JSON.stringify($stateParams));
            var ss = SearchService;
            var opts = ss.getDefaultOptsObj();

            if ($stateParams.size) {
              opts.size = parseInt($stateParams.size);
            }
            if ($stateParams.from) {
              opts.from = parseInt($stateParams.from);
            }
            if ($stateParams.sort) {
              opts.sort = $stateParams.sort.toLowerCase();
            }
            if ($stateParams.date_gte) {
              opts.date.gte = parseInt($stateParams.date_gte);
            }
            if ($stateParams.date_lte) {
              opts.date.lte = parseInt($stateParams.date_lte);
            }

            if ($stateParams.q) {
              var seen = {};
              opts.q = $stateParams.q.filter(function(term){
                if (seen[term]) {
                  return false;
                } else {
                  seen[term] = true;
                  return true;
                }
              });
              opts.q = opts.q.map(function(term) {
                return term.toLowerCase();
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
            return DataService.search(ss.opts);
          }
        }
      })

      .state('books', {
        url: '/books/:bookID',
        templateUrl: config.app.root + '/book_detail/book-detail.html',
        controller: 'BookDetailCtrl',
        resolve: {
          book: function($stateParams) {
            return {_id: $stateParams.bookID}
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
          contributors: function($rootScope, DataService){
            $rootScope.showSpinner = false;
            return DataService.getContributors();
          }
        }
      })

      .state('feedback', {
        url: '/feedback',
        templateUrl: config.app.root + '/partials/feedback.html',
        controller: 'FeedbackFormCtrl'
      })

      .state('thanks', {
        url: '/thanks',
        templateUrl: config.app.root + '/partials/thanks.html',
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
        resolve: {
          spinner: function($rootScope) {
            $rootScope.showSpinner = false;
          }
        }
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
              return searches.filter(function(search) {
                return search.opts.q.length > 0;
              });
            });
          }
        }
      })

      .state('error', {
        url: '/error',
        templateUrl: config.app.root + '/error/error.html',
        controller: 'ErrorCtrl',
      });

    // for nicer URLs w/out '#'. Note: <base> tag required on index.html with html5Mode
    $locationProvider.html5Mode(true);
  }

})();
