(function() {
  'use strict';

  angular
  .module('app.book-detail')
  .controller('BookDetailCtrl', ['$scope', '$stateParams', '$window', 'bookData', 'dcRec', BookDetailCtrl]);

  function BookDetailCtrl($scope, $stateParams, $window, bookData, dcRec) {

    $scope.book = bookData;
    $scope.dc = dcRec;

    $scope.saveAsJson = function (data, filename) {

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

      var blob = new Blob([data], {type: 'text/json'}),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a');

      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
    };

    $scope.redirect = function(){
      $window.location.assign($scope.book._source._record_link);
      return false;
    };
  }

})();
