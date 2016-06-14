(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'book', 'DataService', BookDetailCtrl]);

  function BookDetailCtrl($scope, $stateParams, $window, book, DataService, risRec) {
    $scope.saveAsJson = saveAsJson;
    $scope.saveAsRis = saveAsRis;

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
      $scope.showSpinner = true;
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

    $scope.redirect = function(){
      $window.location.assign($scope.book._source._record_link);
      return false;
    };
  }

})();
