/* Controllers */
(function() {
  'use strict';

  angular.module('app.controller', ['ui.bootstrap'])

  .controller('HomePageCtrl', ['$scope', 'SearchService', '$state',
  function($scope, SearchService, $state, results) {
    //  clear SearchService.opts when state loads
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      SearchService.resetOpts();
    });

    // for when user inits new search.
    // changes state to search.results, which will trigger search operation.
    $scope.newSearch = function(opts) {
      SearchService.resetOpts();

      // convention is to always pass SearchService.opts
      SearchService.updateOpts(opts);
      console.log('~~~newSearch! opts: ' + JSON.stringify(opts));
      $state.go('searchResults', SearchService.opts);
    };
  }])

  .controller('AdvancedCtrl', ['$scope', 'esClient',
    function($scope, esClient) {
      $scope.search = function() {
        // build term list excluding empty fields
        var terms = [];
        Object.keys($scope.query.terms).forEach(function(key) {
          var value = $scope.query.terms[key];
          if(value != '') {
            var hash = {};
            hash[key + '.value'] = value;
            terms.push({'term': hash});
          }
        });

        esClient.search({
          index: 'portal',
          'body': {
            'query': {
              'filtered': {
                'filter': {
                  'bool': {
                    'must': terms
                  }
                }
              }
            }
          }
        }).then(function(response){
          $scope.results = response;
        }, function(error) {
          console.trace(error.message);
        });
      };
    }])

  .controller('AdvFieldController', ['$scope', function($scope) {
      $scope.fields = [
        {name:'Title'},
        {name:'Date'},
        {name:'Subject'}
      ];
      $scope.myField = $scope.fields[0];
    }])

  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'esClient', 'SearchService',
    function($scope, $stateParams, $window, esClient, SearchService) {
      esClient.get({
        index: 'portal',
        type: 'book',
        id: $stateParams.bookID}, function(error, response) {
          if(error) {
            console.log(error);
          }
          else {
            $scope.book = response;

            $scope.saveAsJson = function (data, filename) {

              if (!data) {
                console.error('No data');
                return;
              }

              if (!filename) {
                filename = 'book.json';
              }
              
              if (typeof data === 'object') {
                data = angular.toJson(data, undefined, 2);
                $scope.fileContents = data;
              }

              var blob = new Blob([data], {type: 'text/json'}),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a');

              a.download = filename;
              a.href = window.URL.createObjectURL(blob);
              a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
              e.initMouseEvent('click', true, false, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
              a.dispatchEvent(e);
            };

            $scope.redirect = function(){
              $window.location.assign($scope.book._source._record_link);
              return false;
            };
          }
        });
    }])

    .controller('HeaderCtrl', ['$scope', function ($scope) {
      $scope.header = {name: "header.html", url: "partials/header.html"};
    }])

    .controller('FooterCtrl', ['$scope', function ($scope) {
      $scope.footer = {name: "footer.html", url: "partials/footer.html"};
    }])

    .controller('SearchHelpCtrl', ['$scope', function ($scope) {
      $scope.searchHelp = {name: "searchhelp.html", url: "partials/searchhelp.html"};
    }])

    .controller('FeedbackCtrl', ['$scope', function ($scope) {
      $scope.feedBack = {name: "feedback.html", url: "feedback.html"};
    }])

    .controller('FeedbackFormCtrl', function($scope) {
      $scope.master = {firstName: "", lastName: "", email: "", confirmationEmail: "", organizationName: "", yourFeedback: ""};
      $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
      };
      $scope.reset();
    })

    .controller('FeedbackFieldController', ['$scope', function($scope) {
      $scope.feedbackFields = [
        {name:'Problem'},
        {name:'Question'},
        {name:'Comment'}
      ];
      $scope.myFeedbackField = $scope.feedbackFields[0];
    }])

  .controller('FaqsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
      // sync with the rootScope var so open tabs persist across state changes
      $scope.activeTabs = $rootScope.$activeTabs;
      $scope.faqs = {name: "faqs.html", url: "faqs.html"};

      // check if the tab is active
      $scope.isOpenTab = function (tab) {
        // check if this tab is already in the activeTabs array
        if ($scope.activeTabs.indexOf(tab) > -1) {
          // if so, return true
          return true;
        } else {
          // if not, return false
          return false;
        }
      };

      // function to 'open' a tab
      $scope.openTab = function (tab) {
        // check if tab is already open
        if ($scope.isOpenTab(tab)) {
          //if it is, remove it from the activeTabs array
          $scope.activeTabs.splice($scope.activeTabs.indexOf(tab), 1);

        } else {
          // if it's not, add it!
          $scope.activeTabs.push(tab);
        }
      };
    }])
  .controller('FacetModalCtrl', ['$scope', '$rootScope', '$uibModal', function ($scope, $rootScope, $uibModal){
    $scope.openFacetModal = function(facets, category) {
      var modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        templateUrl: 'search/search.facet_modal.html',
        controller: FacetModalInstanceCtrl,
        resolve: {
          facets: function(){
            console.log(facets);
            return facets;
          },
          category: function(){
            return category;
          }
        }
      });
      modalInstance.result.then(function (facetsToApply) {
        console.log(facetsToApply);
        for(var i = 0; i < facetsToApply.length; i++){
          var facet = facetsToApply[i];
          $scope.updateFacet(facet, facet.active);
        }
      });
    };

  }]);
  var FacetModalInstanceCtrl = function ($scope, $uibModalInstance, facets, category) {
    $scope.text = "";
    $scope.filterCount = 0;
    $scope.currentFacets = [];
    $scope.selectedFacets = [];
    $scope.facetCategories = [];

    $scope.isActive = isActive;
    $scope.switchFacetCategory = switchFacetCategory;
    $scope.isCategorySelected = isCategorySelected;
    $scope.searchFilters = searchFilters;   
    $scope.apply = apply;
    $scope.checkFacet = checkFacet;

    var activeCategory = category;
    var allFacets = [];
    var categoryCounts = {};

    initialize();

    function initialize(){
      allFacets = facets;
      
      $scope.facetCategories = [{
        name: 'type',
        display: 'Type'
      },
      {
        name: 'subject',
        display: 'Subject'
      },
      {
        name: 'creator',
        display: 'Creator'
      },
      {
        name: 'language',
        display: 'Language'
      },
      {
        name: 'grp_contributor',
        display: 'Contributors'
      }];

      $scope.currentFacets = facets[category];
      $scope.categoryFacets = facets[category];
      setFacetsChecked();
    };
    
    
    function setFacetsChecked(){
      for(var prop in allFacets){
        var facetsByProp = allFacets[prop];
        for(var i = 0; i < facetsByProp.length; i++){
          var facet = facetsByProp[i];
          if(facet.active){
            $scope.filterCount++;
            if(categoryCounts[prop]){
              categoryCounts[prop]++;
            } else {
              categoryCounts[prop] = 1;
            }
            
          }
          $scope.selectedFacets[facet.option] = facet.active;
        }
      }
    }

    function switchFacetCategory(newCategory){
      $scope.currentFacets = allFacets[newCategory];
      $scope.categoryFacets = this.currentFacets;
      activeCategory = newCategory;
      $scope.text = "";
    };

    function isActive(cat){
      return (activeCategory === cat);
    };

    function checkFacet(facet){
      var facetCategory = facet.facet;
      var facetText = facet.option;

      if($scope.selectedFacets[facetText]){
        if(categoryCounts[facetCategory]){
          categoryCounts[facetCategory]++;
        } else {
          categoryCounts[facetCategory] = 1;
        }
        $scope.filterCount++;
      } else {
        $scope.filterCount--;
        categoryCounts[facetCategory]--;
      }
    };

    function isCategorySelected(category){
      return categoryCounts[category];
    }

    function apply(){
      var applyFacets = [];
      for(var prop in allFacets){
        var facetsByCategory = allFacets[prop];

        for(var i = 0; i < facetsByCategory.length; i++){
          var facet = facetsByCategory[i];
          if($scope.selectedFacets[facet.option]){
            facet.active = true;
            applyFacets.push(facet);
          }
        }
      }
      $uibModalInstance.close(applyFacets);
    };

    function searchFilters(){   
      var filteredFacets = [];

      for(var i = 0; i < $scope.categoryFacets.length; i++){
        var facet = $scope.categoryFacets[i];
        if(facet.option.toLowerCase().indexOf($scope.text.toLowerCase()) > -1){
          filteredFacets.push(facet);
        }
      }
      $scope.currentFacets = filteredFacets;
    };
};
})();
