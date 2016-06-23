(function() {
  'use strict';
  /* Error Page */

  angular
  .module('app.error')
  .controller('ErrorCtrl', ['$scope', '$stateParams', ErrorCtrl]);

  function ErrorCtrl($scope, $stateParams) {
    $scope.errorMessage = 'There has been an error in the application. We apologize for the inconvenience and thank you for your patience.';
    $scope.showSpinner = false;
  }

})();
