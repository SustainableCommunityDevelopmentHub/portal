module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/lodash/lodash.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/elasticsearch/elasticsearch.angular.min.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angularUtils-pagination/dirPagination.js',
      'app/bower_components/angular-print/angularPrint.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',
      
      'app/*.module.js',
      'app/**/*.module.js',
      'app/*.js',

      'app/search/*.js',
      'app/core/*.js',
      'app/widgets/*.js',
      'app/contributors/*.js',
      'test/unit/**spec.js'
    ],

    autoWatch : true,

    singleRun: true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-safari-launcher'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
