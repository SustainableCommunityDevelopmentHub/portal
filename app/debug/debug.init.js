(function(){
  'use strict';

  // For debugging
  angular.module('app', ['app.debug'])
  .run(['PrintToConsole', function(PrintToConsole) {
    PrintToConsole.active = true;
  }]);

})();

