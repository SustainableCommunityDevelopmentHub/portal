'use strict';

/* Controllers */

var portalControllers = angular.module('portalControllers', []);

portalControllers.controller('SearchCtrl', ['$scope', 'ESclient',
  function($scope, ESclient) {
    $scope.search = function() {
      console.log('searching for ' + $scope.queryTerm);
      ESclient.search({
        index: 'portal',
        type: 'book',
        q: 'title:' + $scope.queryTerm
      }).then(function(response){
        console.log('Got results:\n');
        console.dir(response.hits.hits);
        $scope.results = response;
      }), function(error) {
        console.trace(error.message);
      }
    }
  }]);

portalControllers.controller('BookDetailCtrl', ['$scope', '$routeParams', 'ESclient',
  function($scope, $routeParams, ESclient) {
    $scope.book = ESclient.get({
      index: 'portal',
      type: 'book',
      id: $routeParams.bookID},
    function(phone) {
      $scope.thumbUrl = book.thumbnail;
    });
  }]);
