exports.config = {
  allScriptsTimeout: 11000,

  rootElement: '.app',

  specs: [
    'spec.js',
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
    return browser.get('http://local.portal.dev:8000/'); // Added return statement here
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 45000
  }
};
