'use strict';

var ResultsPage = require('../page_objects/results.page.js');

var HomePage = function() {
  browser.get('');
};

HomePage.prototype = Object.create(ResultsPage.prototype, {
    submitHomePageQuery: { value: function(query) {
        element(by.model('queryTerm')).sendKeys(query);
        element(by.id('go-btn')).click();
    }}
});

module.exports = HomePage;