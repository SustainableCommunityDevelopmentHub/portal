(function() {
  'use strict';

  angular.module('app.core')
    .constant('config', {
        elastic: {
          host: 'local.portal.dev',
          port: '9200',
          apiVersion: '2.0'
        }
    });
})();
