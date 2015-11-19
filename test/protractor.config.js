exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  chromeOnly: true,

  baseUrl: 'http://localhost:8000/',

  framework: 'jasmine',

  seleniumAddress: 'http://localhost:4444/wd/hub',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
