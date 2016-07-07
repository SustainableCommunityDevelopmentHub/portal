(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$window', 'book', 'DataService', '$http', BookDetailCtrl]);

  function BookDetailCtrl($scope, $rootScope, $stateParams, $window, book, DataService, $http, risRec) {
    $scope.saveAsJson = saveAsJson;
    $scope.saveAsRis = saveAsRis;
    $scope.contribHome = contribHome;

    $scope.showSpinner = true;
    $scope.book = book;
    DataService.getBookData($scope.book._id).success(function(data) {
      var bookData = data._source;
      bookData._id = data._id;
      $scope.book = bookData;
    }).finally(function() {
      $scope.showSpinner = false;
    });

    function saveAsJson() {
      var filename = 'book.json';
      DataService.getDcRec($scope.book._id).success(function(data) {
        if (typeof data === 'object') {
          data = angular.toJson(data, undefined, 2);
          $scope.fileContents = data;
        }
        createBlobAndDownload(data, 'text/json', filename);
      }).finally(function() {
        $scope.showSpinner = false;
      });
    };

    function saveAsRis() {
      var filename = 'book.ris';
      $scope.showSpinner = true;
      DataService.getRisRec($scope.book._id).success(function(data) {
        $scope.fileContentsRis = data;
        createBlobAndDownload(data, 'application/x-research-info-systems', filename);
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

  }

})();
