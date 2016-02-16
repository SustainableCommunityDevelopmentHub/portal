module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/lodash/lodash.js',

      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/elasticsearch/elasticsearch.angular.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angularUtils-pagination/dirPagination.js',
      'app/bower_components/angular-print/angularPrint.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',

      'app/bower_components/angular-mocks/angular-mocks.js',

      'app/*.module.js',
      'app/**/*.module.js',
      'app/*.js',
      // once we create a 'src' dir to hold this, can simplify below to...
      //..'app/src/*.js' -- currently we must avoid loading certain bower_component .js files
      'app/search/*.js',
      'app/core/*.js',
      'app/widgets/*.js',
      'app/contributors/*.js',

      // helpers for jasmine, etc
      'test/mockData.js'
    ],


    // list of files to exclude
    exclude: ['app/**/*.e2e.spec.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // if client.captureConsole is true,
    // console.log statements from app are outputted to terminal
    client: {
      captureConsole: false
    },

    // type(s) of loggers to use. if unset default is {type: 'console'}
    //loggers: [
      //{type: 'file', filename: 'logs/mylog.log'}
    //],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};