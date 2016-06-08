(function() {
  'use strict';
  /* Error Page */

  angular
  .module('app.error')
  .controller('ErrorCtrl', ['$scope', 'SearchService', ErrorCtrl]);

  function ErrorCtrl($scope, SearchService) {
    var ss = SearchService;

  }

})();
