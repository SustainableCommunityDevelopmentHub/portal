'use strict';

/* Controllers */

var portalControllers = angular.module('portalControllers', []);

portalControllers.controller('SearchCtrl', ['$scope', 'ESclient',
  function($scope, ESclient) {
    $scope.search = function() {
      ESclient.search({
        index: 'portal',
        type: 'book',
        q: $scope.queryTerm
      }).then(function(response){
        $scope.results = response;
      }, function(error) {
        console.trace(error.message);
      });
    }
  }]);

portalControllers.controller('AdvancedCtrl', ['$scope', 'ESclient',
  function($scope, ESclient) {
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

      ESclient.search({
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
