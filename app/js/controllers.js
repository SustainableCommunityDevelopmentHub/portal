'use strict';

/* Controllers */

var portalControllers = angular.module('portalControllers', []);

portalControllers.controller('SearchCtrl', ['$scope', 'esClient',
  function($scope, esClient) {
    $scope.search = function() {
      esClient.search({
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

portalControllers.controller('AdvancedCtrl', ['$scope', 'esClient',
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
  }]);

portalControllers.controller('AdvFieldController', ['$scope', function($scope) {
    $scope.fields = [
      {name:'Title'},
      {name:'Date'},
      {name:'Subject'}
    ];
    $scope.myField = $scope.fields[0]; 
  }]);

portalControllers.controller('BookDetailCtrl', ['$scope', '$routeParams', 'esClient',
  function($scope, $routeParams, esClient) {
    esClient.get({
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

portalControllers.controller('ContributorsCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.searchHelp = {name: "contributors.html", url: "partials/contributors.html"};
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

portalControllers.controller('FeedbackCtrl', ['$scope', '$routeParams',
  function ($scope) {
    $scope.feedBack = {name: "feedback.html", url: "feedback.html"};
}]);

portalControllers.controller('FeedbackFormCtrl', function($scope) {
    $scope.master = {firstName: "", lastName: "", email: "", confirmationEmail: "", organizationName: "", yourFeedback: ""};
    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };
    $scope.reset();
});

portalControllers.controller('FeedbackFieldController', ['$scope', function($scope) {
    $scope.feedbackFields = [
      {name:'Problem'},
      {name:'Question'},
      {name:'Comment'}
    ];
    $scope.myFeedbackField = $scope.feedbackFields[0]; 
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
