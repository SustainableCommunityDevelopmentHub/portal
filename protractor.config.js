exports.config = {
  allScriptsTimeout: 11000,

  rootElement: '.app',

  specs: [
    'src/client/app/**/*e2e.spec.js',
    'src/client/app/*e2e.spec.js'
  ],

  multiCapabilities: [
    {'browserName': 'chrome'},
    {'browserName': 'firefox'}
  ],

  maxSessions: 1,

  //chromeOnly: true,

  baseUrl: 'http://local.portal.dev:8000/',

  framework: 'jasmine',


  onPrepare: function() {
    browser.driver.manage().window().maximize();
    require('protractor-uisref-locator')(protractor);
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 45000
  }
};
