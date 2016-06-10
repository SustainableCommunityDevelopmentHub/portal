/* Controllers */
(function() {
  'use strict';

  angular.module('app.controller', ['ui.bootstrap'])
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'bookData',
    function($scope, $stateParams, $window, bookData) {

      $scope.book = bookData;

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

    .controller('FeedbackFormCtrl', ['config', '$scope', '$http', '$location', '$window', function (config, $scope, $http, $location, $window) {
      $scope.master = {first_name: "", last_name: "", email: "", confirmation_email: "", organization: "", user_feedback: ""};
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
      $scope.sendMail = function () {
        var data = $scope.user;
        var req = {
          method: 'POST',
          url: config.django.host + ':' + config.django.port + '/api/send-email/',
          headers: { 'Content-Type': 'application/json' },
          data: data,
        };
        $http(req).then(successCallback, errorCallback); 
        function successCallback(response) {
          console.log(data);
          console.log("message successfully sent");
          $state.go('thanks');
        };
        function errorCallback(response) {
          console.log("message failed"); 
        };
      };
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
      modalInstance.result.then(function (facets) {
        if (facets){
          var activatedFacets = facets[0];
          var deactivatedFacets = facets[1];
          activatedFacets.forEach(function(facet) {
            $scope.updateFacet(facet, true);
          });
          deactivatedFacets.forEach(function(facet) {
            $scope.updateFacet(facet, false);
          });
        }
      });
    };
  }])
  .controller('FacetModalInstanceCtrl', ['$scope', '$uibModalInstance', 'facets', 'category', function ($scope, $uibModalInstance, facets, category) {
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
    $scope.toggleFilterView = toggleFilterView;
    $scope.close = close;
    $scope.filterViewText = "See Only Checked Filters";

    var seeOnlyCheckedText = ["See Only Checked Filters", "See All Filters"];
    var seeOnlyChecked = false;
    var activeCategory = category;
    var allFacets = [];
    var categoryCounts = {};
    var facetsToApply = {};

    initialize();

    function initialize(){
      allFacets = facets;
      $scope.facetCategories = [{
        name: 'creator',
        display: 'Creator/ Contributor'
      },
      {
        name: 'subject',
        display: 'Subject'
      },
      {
        name: 'language',
        display: 'Language'
      },
      {
        name: 'grp_contributor',
        display: 'From'
      }];

      $scope.currentFacets = facets[category];
      $scope.categoryFacets = facets[category];
      setFacetsChecked();
    }

    function getFacetKey(facet) {
      return facet.category + facet.value;
    }

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
            var key = getFacetKey(facet);
            facetsToApply[key] = {
              facetObj: facet,
              checked: true
            };
          }
          $scope.selectedFacets[facet.value] = facet.active;
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
    }

    function isActive(cat){
      return (activeCategory === cat);
    }

    function checkFacet(facet){
      var facetCategory = facet.category;
      var facetText = facet.value;

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
      var key = getFacetKey(facet);
      if (facetsToApply[key]) {
        facetsToApply[key].checked = !facetsToApply[key].checked;
      } else {
        facetsToApply[key] = {
          facetObj: facet,
          checked: true
        };
      }
    }

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
          if($scope.selectedFacets[currentFacet.value]){
            checkedFilters.push(currentFacet);
          }
        }
        $scope.currentFacets = checkedFilters;
      } else {
        $scope.filterViewText = seeOnlyCheckedText[0];
        $scope.currentFacets = allFacets[activeCategory];
      }
    }

    function apply(){
      var activated = [];
      var deactivated = [];
      for (var facetKey in facetsToApply) {
        var facet = facetsToApply[facetKey].facetObj;
        if (facetsToApply[facetKey].checked) {
          activated.push(facet);
        } else {
          deactivated.push(facet);
        }
      }
      var facetsToUpdate = [activated, deactivated];
      $uibModalInstance.close(facetsToUpdate);
    }

    function close() {
      $uibModalInstance.close();
    }

    function searchFilters(){
      var filteredFacets = [];

      for(var i = 0; i < $scope.categoryFacets.length; i++){
        var facet = $scope.categoryFacets[i];
        if(facet.value.toLowerCase().indexOf($scope.text.toLowerCase()) > -1){
          filteredFacets.push(facet);
        }
      }
      $scope.currentFacets = filteredFacets;
    }
}]);
})();
