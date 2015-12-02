(function() {
  'use strict';

  angular
    .module('app.widgets')
    .config(['paginationTemplateProvider', function(paginationTemplateProvider){
      // Set template for dirPagination directive
      console.log('...widgetConfig: Setting paginationTemplateProvider');
      paginationTemplateProvider.setPath('bower_components/angularUtils/dirPagination.custom.tpl.html');
    }]);

})();
