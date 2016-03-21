/* Controllers */
(function() {
  'use strict';

  angular.module('app.controller', ['ui.bootstrap'])

  .controller('HomePageCtrl', ['$scope', 'SearchService', '$state', 'searchResults',
  function($scope, SearchService, $state, searchResults) {

    $scope.numTotalHits = searchResults.numTotalHits;

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
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'bookData', 
    function($scope, $stateParams, $window, bookData) {

      $scope.book = bookData;
      $scope.refresh = function() {
        console.log("refresh!");
      };

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

    }])

    .controller('SearchHelpCtrl', ['config', '$scope', function (config, $scope) {
      $scope.searchHelp = {name: "searchhelp.html", url: config.app.root + "/partials/help.html"};
    }])

    .controller('FeedbackFormCtrl', ['$scope', function ($scope) {
      $scope.master = {firstName: "", lastName: "", email: "", confirmationEmail: "", organizationName: "", yourFeedback: ""};
      $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
        $scope.isMatch = function() {
          if ($scope.user.email === $scope.user.confirmationEmail) {
            return true;
          }
          return false;
        };
      };
      $scope.reset();
      $scope.feedbackErrors =[
        {msg: 'This field is required.'},
        {msg: 'Please enter a valid email address.'},
        {msg: 'Email addresses do not match.'}
      ];
      
    }])

    .controller('FeedbackFieldController', ['$scope', function($scope) {
      $scope.feedbackFields = [
        {name:'Problem'},
        {name:'Question'},
        {name:'Comment'}
      ];
      $scope.myFeedbackField = $scope.feedbackFields[0];
    }])

  .controller('FaqsCtrl', ['$scope', '$rootScope', 'config', function ($scope, $rootScope, config) {
      // sync with the rootScope var so open tabs persist across state changes
      $scope.activeTabs = $rootScope.$activeTabs;
      $scope.faqs = {name: "faqs.html", url: config.app.root + "/partials/faqs.html"};

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
  .controller('FacetModalCtrl', ['$scope', '$rootScope', 'config', '$uibModal', function ($scope, $rootScope, config, $uibModal){
    $scope.openFacetModal = function(facets, category) {
      var modalInstance = $uibModal.open({
        animation: true,
        scope: $scope,
        templateUrl: config.app.root + '/search/search.facet_modal.html',
        controller: 'FacetModalInstanceCtrl',
        resolve: {
          facets: function(){
            return facets;
          },
          category: function(){
            return category;
          }
        }
      });
      modalInstance.result.then(function (facetsToApply) {
        if(facetsToApply){
          for(var i = 0; i < facetsToApply.length; i++){
            var facet = facetsToApply[i];
            //updateFacet from SearchCtrl. Might have to change if that controller is refactored.
            $scope.updateFacet(facet, facet.active);
          }
        }
      });
    };



  }])
  .controller('FacetModalInstanceCtrl', ['$scope', '$uibModalInstance', 'facets', 'category', function ($scope, $uibModalInstance, facets, category) {
    $scope.text = "";
    $scope.filterCount = 0;
    $scope.currentFacets;
    $scope.selectedFacets = [];
    $scope.facetCategories = [];

    $scope.isActive = isActive;
    $scope.switchFacetCategory = switchFacetCategory;
    $scope.isCategorySelected = isCategorySelected;
    $scope.searchFilters = searchFilters;
    $scope.apply = apply;
    $scope.checkFacet = checkFacet;
    $scope.toggleFilterView = toggleFilterView;
    $scope.close = close;
    $scope.filterViewText = "See Only Checked Filters";

    var seeOnlyCheckedText = ["See Only Checked Filters", "See All Filters"];
    var seeOnlyChecked = false;
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
      seeOnlyChecked = false;
      $scope.filterViewText = seeOnlyCheckedText[0];
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

    function toggleFilterView(){
      seeOnlyChecked = !seeOnlyChecked;
      if(seeOnlyChecked){
        $scope.filterViewText = seeOnlyCheckedText[1];
        var checkedFilters = [];
        for (var i = 0; i < $scope.currentFacets.length; i++){
          var currentFacet = $scope.currentFacets[i];
          if($scope.selectedFacets[currentFacet.option]){
            checkedFilters.push(currentFacet);
          }
        }
        $scope.currentFacets = checkedFilters;
        //$scope.categoryFacets = this.currentFacets;
      } else {
        $scope.filterViewText = seeOnlyCheckedText[0];
        $scope.currentFacets = allFacets[activeCategory];
      }
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

    function close() {
      $uibModalInstance.close();
    }

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
}]);
})();
