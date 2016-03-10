(function() {
  'use strict';

  angular
    .module('app.widgets', [])
    .filter('stripspaces', [function() {
        return function(input) {
            if (!angular.isString(input)) {
                return input;
            }
            return input.replace(/[\s]/g, '');
        }
    }]);
    
})();