(function() {
    'use strict'
    angular.module('portal.config', [])
        .constant('server', {
            host: 'local.portal.dev',
            port: '9200'
    });
})();
