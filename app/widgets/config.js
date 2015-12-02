(function() {
  'use strict';

  angular
    .module('app.widgets')
    .config([widgetConfig]);

    function widgetConfig(paginationTemplateProvider){
      // Set template for dirPagination directive
      paginationTemplateProvider.setPath('bower_components/angularUtils/dirPagination.custom.tpl.html');
    };

})();
