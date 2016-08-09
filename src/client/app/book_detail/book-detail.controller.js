(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', '$state', 'book', 'DataService', BookDetailCtrl]);

  function BookDetailCtrl($scope, $stateParams, $window, $state, book, DataService) {
    $scope.saveAsJson = saveAsJson;
    $scope.saveAsRis = saveAsRis;

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
          data = angular.toJson(data, undefined, 2);
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
        createBlobAndDownload(data, 'application/x-research-info-systems', filename);
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
  }

})();
