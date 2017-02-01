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
    seeNewRecords: { value: function(term) {
      element(by.css('[ng-click="mostRecentSearch()"]')).click();
    }},
    contactUs: { value: function() {
        element(by.id('contact-us')).click();
    }},
    privacyPolicy: { value: function() {
        element(by.id('privacy-policy')).click();
    }},
    termsOfUse: { value: function() {
        element(by.id('terms-of-use')).click();
    }},
    facetChips: { get: function() {
      return element.all(by.css(".facet-chip a"));
    }},
    clickHome: { value: function() {
      element(by.id('home')).click();
    }},
    newContributors: { get: function() {
        return element.all(by.css(".new-contributors-item"));
    }}
});

module.exports = HomePage;
