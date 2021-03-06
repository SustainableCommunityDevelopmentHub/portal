/* Controllers */
(function() {
  'use strict';

  angular.module('app.controller', ['ui.bootstrap'])
    .controller('SearchHelpCtrl', ['config', '$scope', function (config, $scope) {
      $scope.searchHelp = {name: "searchhelp.html", url: config.app.root + "/partials/help.html"};
      $scope.showSpinner = false;
    }])

    .controller('FeedbackFormCtrl', ['config', '$scope', '$state', '$http', '$location', '$window', function (config, $scope, $state, $http, $location, $window) {
      $scope.showSpinner = false;
      $scope.feedbackFields = ['Problem','Question','Comment'];
      $scope.master = {first_name: "", last_name: "", email: "", confirmation_email: "", organization: "", type_of_feedback: $scope.feedbackFields[0], user_feedback: ""};
      $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
        $scope.isMatch = function() {
          if ($scope.user.email === $scope.user.confirmation_email) {
            return true;
          }
          return false;
        };
      };
      $scope.reset();
      $scope.sendMail = function () {
        if ($scope.feedbackForm.$valid && $scope.isMatch()) {
          var data = $scope.user;
          var req = {
            method: 'POST',
            url: config.django.host + ':' + config.django.port + '/api/send-email/',
            headers: { 'Content-Type': 'application/json' },
            data: data,
          };
          $http(req).then(function (response) {
            console.log(data);
            console.log("message successfully sent");
            $state.go('thanks');
          }, function (response) {
            $state.go('thanks');
          }); 
        }
        else {
          $scope.feedbackForm.$submitted = true
        }
      };             
      $scope.feedbackErrors =[
        {msg: 'This field is required.'},
        {msg: 'Please enter a valid email address.'},
        {msg: 'Email addresses do not match.'}
      ];

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
