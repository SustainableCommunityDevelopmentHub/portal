/* jshint node: true */

var isDebug = process.env.DEBUG || false;
var browsers = ['Chrome', 'Firefox'];
if(isDebug){
   console.log('~~~~RUNNING TESTS IN DEBUG MODE~~~~~');
   browsers = ['PhantomJS'];
 }

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'src/client/bower_components/jquery/dist/jquery.js',
      'src/client/bower_components/lodash/lodash.js',

      'src/client/bower_components/angular/angular.js',
      'src/client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'src/client/bower_components/angular-resource/angular-resource.js',
      'src/client/bower_components/elasticsearch/elasticsearch.angular.js',
      'src/client/bower_components/angular-animate/angular-animate.js',
      'src/client/bower_components/angularUtils-pagination/dirPagination.js',
      'src/client/bower_components/angular-print/angularPrint.js',
      'src/client/bower_components/angular-bootstrap/ui-bootstrap.js',
      'src/client/bower_components/ngSmoothScroll/angular-smooth-scroll.js',

      'src/client/bower_components/angular-mocks/angular-mocks.js',

      'src/client/app/*.module.js',
      'src/client/app/**/*.module.js',
      'src/client/app/*.js',
      // once we create a 'src' dir to hold this, can simplify below to...
      //..'app/src/*.js' -- currently we must avoid loading certain bower_component .js files
      'src/client/app/search/*.js',
      'src/client/app/core/*.js',
      'src/client/app/widgets/*.js',
      'src/client/app/contributors/*.js',
      'src/client/app/advanced_search/*.js',
      'src/client/app/partials/save-record-button.html',
      'src/client/app/saved_records/*.js',

      // helpers for jasmine, etc
      'test/mockData.js'
    ],


    // list of files to exclude
    exclude: ['src/client/app/**/*.e2e.spec.js'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      "karma-spec-reporter",
      'karma-ng-html2js-preprocessor'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "src/client/app/partials/save-record-button.html": 'ng-html2js'
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'src/client/',
      moduleName: 'templates',
      files: [
        "app/partials/save-record-button.html"
      ]
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
    autoWatch: isDebug,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: browsers,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
