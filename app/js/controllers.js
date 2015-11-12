/* Controllers */
(function() {
  'use strict';

  angular.module('portalControllers', [])

  .controller('SearchController', ['$scope', 'dataService', '$state', '$stateParams',
  function($scope, dataService, $state, $stateParams) {
    // Execute search query, handle returned promise from dataService
    $scope.search = function(queryTerm) {
      dataService.search(queryTerm)
        .then(function(response){
          $scope.results = response;
        })
        .catch(function(err){
          console.log(err.message);
        });
    };

    // For when user inits search from homepage or anywhere not search.results. Executes search,then changes state to search.results.
    $scope.searchAndTransition = function(queryTerm) {
      console.log('~~~searchAndTransition! queryTerm: ' + queryTerm);
      dataService.search(queryTerm)
        .then(function(response){
          $scope.results = response;
        })
        .then(function(){
          console.log(JSON.stringify($scope.results));
          $state.go('searchResults', {q: queryTerm});
        })
        .catch(function(err){
          console.log(err.message);
        });
    };


  }])

  // Old - To be removed. SearchController is newest
  .controller('SearchCtrl', ['$scope', 'dataService',
  function($scope, dataService) {

    // Execute search query, handle returned promise from dataService
    $scope.search = function() {
      dataService.search($scope.queryTerm)
        .then(function(response){
          // $scope.results effects css hide/shows
          $scope.results = response;
        })
        .catch(function(err){
          console.log(err.message);
        });
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

  .controller('BookDetailCtrl', ['$scope', '$stateParams', 'esClient',
    function($scope, $stateParams, esClient) {
      esClient.get({
        index: 'portal',
        type: 'book',
        id: $stateParams.bookID}, function(error, response) {
          if(error) {
            console.log(error);
          } else {
            $scope.book = response;
          }
        });
    }])

  .controller('ContributorsCtrl', ['$scope', function ($scope) {
      $scope.searchHelp = {name: "contributors.html", url: "partials/contributors.html"};
      $scope.contributors = [
        {name:'Gallica Bibliotheque Nationale de France', num_records: '27,274'},
        {name:'Getty Research Institute', num_records: '27,274'},
        {name:'Heidelberg University Library', num_records: '15,873'},
        {name:'Institut National d\'Histoire de l\'Art', num_records: '5,377'},
        {name:'Metropolitan Museum of Art', num_records: '4,647'},
        {name:'Smithsonian Libraries', num_records: '2,991'},
        {name:'Library of the Philadelphia Museum of Art', num_records: '1,726'},
        {name:'Avery Architectural & Fine Arts Library at Columbia University', num_records: '1,425'},
        {name:'Sterling and Francine Clark Art Institute Library', num_records: '335'},
        {name:'Frick Art Reference Library', num_records: '284'},
        {name:'Getty Publications Virtual Library', num_records: '236'},
        {name:'Brooklyn Museum Libraries and Archives', num_records: '122'},
        {name:'National Gallery of Canada Library and Archives', num_records: '36'},
        {name:'Kunsthistorisches Institut in Florenz', num_records: '35'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'}
      ];
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

  .controller('FaqsCtrl', ['$scope', function ($scope) {
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

})();
