'use strict';

var ResultsPage = require('../page_objects/results.page.js');

var AdvancedPage = function() {
  browser.get('/advanced');
};

AdvancedPage.prototype = Object.create(ResultsPage.prototype, {
    addKeywordTerm: { value: function(term) {
        element(by.model('queryTerm')).sendKeys(term);
    }},
    submitAdvancedSearch: { value: function() {
        element.all(by.css('.search-btn')).get(0).click();
    }},
    submitWithEnterBtn: { value: function() {
        element(by.css('.search-btn')).sendKeys(protractor.Key.ENTER);
    }},
    submitFiltersWithEnter: { value: function() {
        element(by.model('filter.text')).sendKeys(protractor.Key.ENTER);
    }},
    openFieldSelector: { value: function(position) {
        element.all(by.css('.filter-dropdown')).get(position).click();
    }},
    selectField: { value: function(fieldName) {
        element(by.linkText(fieldName)).click();
    }},
    submitFieldKeywords: { value: function(pos, terms) {
        element.all(by.css('.sf-input')).get(pos).sendKeys(terms);
    }},
    clickPlusButton: { value: function(position) {
        element.all(by.css('.plus-button')).get(position).click();
    }},
    addFilterSearches: { value: function(field_value_list) {
        for (var i=0; i<field_value_list.length; i++) {
            var pair = field_value_list[i];
            this.openFieldSelector(i);
            this.selectField(pair[0]);
            this.submitFieldKeywords(i, pair[1]);
            this.clickPlusButton(i);
        }
    }}
});

module.exports = AdvancedPage;