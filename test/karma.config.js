module.exports = function(config){
  config.set({

    basePath : '',

    files : [
      // load angular app dependencies from bower
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/lodash/lodash.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/elasticsearch/elasticsearch.js',
      'app/bower_components/angularUtils-pagination/dirPagination.js',
      'app/bower_components/angular-print/angularPrint.js',

      // app source code & test files
      'app/*.js',
      'app/**/*.js',
    ],

    autoWatch : true,

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
