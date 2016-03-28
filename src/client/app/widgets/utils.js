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
        };
    }])
    .filter('capitalize', [function() {
      return function(input) {
        if (!angular.isString(input)) {
          return input;
        }
        var capitalized = input.charAt(0).toUpperCase() + input.slice(1);
        return capitalized;
      };
    }]);
    
})();