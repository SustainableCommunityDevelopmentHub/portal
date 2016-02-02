exports.config = {
  allScriptsTimeout: 11000,

  rootElement: '.app',

  specs: [
    '**/*spec.js'
  ],

  multiCapabilities: [{
    'browserName': 'chrome'
  }, {
    'browserName': 'firefox'
  }],

  chromeOnly: true,

  baseUrl: 'http://local.portal.dev:8000/',

  framework: 'jasmine',


  onPrepare: function() {
    browser.driver.manage().window().maximize();
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 45000
  }
};
