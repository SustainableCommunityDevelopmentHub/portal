(function() {
  'use strict';
  /* Error Page */

  angular
  .module('app.error')
  .controller('ErrorCtrl', ['$scope', '$stateParams', ErrorCtrl]);

  function ErrorCtrl($scope, $stateParams) {
    $scope.errorMessage = getErrorMessage($stateParams.error);

    function getErrorMessage(error){
      var defaultMessage = 'There has been an error in the application. We apologize for the inconvenience and thank you for your patience.';

      // Put conditionals for all possible error types here
      if(error.error === 'NONEXISTENT_STATE'){
        return 'It looks like something is wrong with the page which you tried to visit. We apologize for the incovenience and thank you for your patience.';
      }
      else {
        return defaultMessage;
      }
    }

  }

})();
