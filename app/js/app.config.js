(function() {
    'use strict'
    angular.module('portal.config', [])
        .constant('elastic', {
            host: 'local.portal.dev',
            port: '9200',
            apiVersion: '1.7'
    });
})();
