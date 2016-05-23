/* jshint node: true */
/* globals by */
'use strict';

var ResultsPage = require('../page_objects/results.page.js');

var HomePage = function() {
  browser.get('');
};

HomePage.prototype = Object.create(ResultsPage.prototype, {
    submitHomePageQuery: { value: function(query) {
        element(by.model('queryTerm')).sendKeys(query);
        element(by.id('go-btn')).click();
    }},
    seeAll: { value: function() {
        element(by.id('see-all-btn')).click();
    }},
    searchBar: { get: function() {
    return element.all(by.css(".search-input")).get(0);
  }},
});

module.exports = HomePage;
