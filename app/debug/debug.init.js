(function(){
  'use strict';

  // For debugging
  angular.module('portalApp', ['app.debug'])
  .run(['PrintToConsole', function(PrintToConsole) {
    PrintToConsole.active = true;
  }]);

})();

