'use strict';

/* Controllers */

var portalControllers = angular.module('portalControllers', []);

portalControllers.controller('SearchCtrl', ['$scope', 'ESclient',
  function($scope, ESclient) {
    $scope.search = function() {
      ESclient.search({
        index: 'portal',
        type: 'book',
        q: 'title:' + $scope.queryTerm
      }).then(function(response){
        $scope.results = response;
      }, function(error) {
        console.trace(error.message);
      });
    }
  }]);

portalControllers.controller('BookDetailCtrl', ['$scope', '$routeParams', 'ESclient',
  function($scope, $routeParams, ESclient) {
    ESclient.get({
      index: 'portal',
      type: 'book',
      id: $routeParams.bookID}, function(error, response) {
        if(error) {
          console.log(error);
        } else {
          $scope.book = response;
        }
      });
  }]);
