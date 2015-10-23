(function() {
    'use strict'
    angular.module('portal.config', [])
        .constant('portalConfig', {
            host: 'local.portal.dev',
            port: '9200'
    });
})();
