exports.config = {
  allScriptsTimeout: 11000,

  rootElement: '.app',

  specs: [
    'spec.js',
    'sort_spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  chromeOnly: true,

  baseUrl: 'http://localhost:8000/',

  framework: 'jasmine',

  onPrepare: function() {
    browser.driver.manage().window().maximize();
    return browser.get('http://local.portal.dev:8000/'); // Added return statement here
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
