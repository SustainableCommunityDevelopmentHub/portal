(function () { 
 return angular.module("app.env.config", [])
.constant("config", {"elastic":{"host":"local.portal.dev","port":"9200","apiVersion":"2.0"},"app":{"root":"app"},"django":{"host":"http://local.portal.dev","port":"8000"}});

})();
