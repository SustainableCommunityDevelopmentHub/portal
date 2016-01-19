exports.config = {
  allScriptsTimeout: 11000,

  rootElement: '.app',

  specs: [
    '*spec.js'
  ],

  multiCapabilities: [{
    'browserName': 'firefox'
  }, {
    'browserName': 'chrome'
  }],


  baseUrl: 'http://local.portal.dev:8000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
