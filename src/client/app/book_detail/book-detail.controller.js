(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'bookData', 'dcRec', 'DataService', 'risRec', BookDetailCtrl]);

  function BookDetailCtrl($scope, $stateParams, $window, bookData, dcRec, DataService, risRec) {

    $scope.book = bookData;
    $scope.dc = dcRec;
    $scope.ris = risRec;
    $scope.saveAsJson = saveAsJson;
    $scope.saveAsRis = saveAsRis;

    function saveAsJson(data, filename) {
      if (!data) {
        console.error('No data');
        return;
      }

      if (!filename) {
        filename = 'book.json';
      }

      if (typeof data === 'object') {
        data = angular.toJson(data, undefined, 2);
        $scope.fileContents = data;
      }

      createBlobAndDownload(data, 'text/json', filename);
    }

    function saveAsRis(data, filename) {
      if (!data) {
        console.error('No data');
        return;
      }

      if (!filename) {
        filename = 'book.ris';
      }

      $scope.fileContentsRis = data;
      createBlobAndDownload(data, 'application/x-research-info-systems', filename);
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
