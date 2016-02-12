(function() {
  'use strict';

  angular
    .module('app.widgets')
    .config(['config', 'paginationTemplateProvider', function(config, paginationTemplateProvider){
      // Set template for dirPagination directive
      console.log('...widgetConfig: Setting paginationTemplateProvider');
      paginationTemplateProvider.setPath(config.app.root + '/bower_components/angularUtils/dirPagination.custom.tpl.html');
    }]);

})();
