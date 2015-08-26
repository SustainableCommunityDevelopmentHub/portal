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
    };
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

portalControllers.controller('HeaderCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.header = {name: "header.html", url: "partials/header.html"};
}]);

portalControllers.controller('FooterCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.footer = {name: "footer.html", url: "partials/footer.html"};
}]);

portalControllers.controller('SearchHelpCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.searchHelp = {name: "searchhelp.html", url: "partials/searchhelp.html"};
}]);

portalControllers.controller('FaqsCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.faqs = {name: "faqs.html", url: "faqs.html"};
    $scope.activeTabs = [];

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

}]);
