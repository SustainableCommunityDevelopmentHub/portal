(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$window', '$state', 'book', 'DataService', 'SearchService', 'ADVANCED_SEARCH', '$http', BookDetailCtrl]);

  function BookDetailCtrl($scope, $rootScope, $stateParams, $window, $state, book, DataService, SearchService, ADVANCED_SEARCH, $http) {
    $scope.saveAsJson = saveAsJson;
    $scope.saveAsRis = saveAsRis;
    $scope.contribHome = contribHome;

    $scope.showSpinner = true;
    $scope.book = book;
    DataService.getBookData($scope.book._id).then(function(response) {
      var bookData = response.data._source;
      bookData._id = response.data._id;
      $scope.book = bookData;
    }, function() {
      $state.go('error');
    })
    .finally(function() {
      $scope.showSpinner = false;
    });

    function saveAsJson() {
      var filename = 'book.json';
      $scope.showSpinner = true;
      DataService.getDcRec($scope.book._id).then(function(data) {
        if (typeof data === 'object') {
          data = angular.toJson(data);
          $scope.fileContents = data;
        }
        createBlobAndDownload(data, 'text/json', filename);
      }, function() {
        $state.go('error');
      }).finally(function() {
        $scope.showSpinner = false;
      });
    };

    function saveAsRis() {
      var filename = 'book.ris';
      $scope.showSpinner = true;
      DataService.getRisRec($scope.book._id).then(function(data) {
        $scope.fileContentsRis = data;
        createBlobAndDownload(data.data, 'application/x-research-info-systems', filename);
      }, function() {
        $state.go('error');
      }).finally(function() {
        $scope.showSpinner = false;
      });
    }

    function createBlobAndDownload(data, MimeType, filename){
      var blob = new Blob([data], {type: MimeType}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = [MimeType, a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
    }

    // fetches websites from json file, using $scope.book._grp_contributor as key
    function contribHome() {
      $http.get('/app/contributors/contributor_websites.json').success(function(data) {
        var websites = data;
        window.location = websites[$scope.book._grp_contributor];
      });
    };

    $scope.redirect = function(){
      $window.location.assign(book._source._record_link);
      return false;
    };

    $scope.searchWithFacet = function(category, term) {
      SearchService.resetOpts();
      var field = SearchService.buildAdvancedField(ADVANCED_SEARCH[category], term);
      SearchService.opts.advancedFields.push(field);
      SearchService.transitionStateAndSearch();
    };

    $scope.searchWithKeyword = function(keyword) {
      SearchService.resetOpts();
      SearchService.opts.q.push(keyword);
      SearchService.transitionStateAndSearch();
    };

  }

})();
