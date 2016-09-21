(function () { 
 return angular.module("app.env.config", [])
.constant("config", {"env":"local","elastic":{"host":"local.portal.dev","port":"9200","apiVersion":"2.0"},"app":{"root":"app"},"django":{"host":"http://127.0.0.1","port":"8000"}, "oldestDate": 1085});

})();
