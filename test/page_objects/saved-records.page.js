'use strict';


var SavedRecordsPage = function() {
  browser.get('/saved');
};


SavedRecordsPage.prototype = Object.create({}, {
  getNumSavedRecords: {value: function() {
    return element.all(by.css('.num-records p b')).get(0);
  }},
  getAllRecords: {value: function() {
    return element.all(by.css('.saved-records-list')).get(0).evaluate('savedRecords');
  }},
  getAllTitles: {value: function() {
    var result = this.getAllRecords().then(function(records) {
      var titles = [];
      records.forEach(function(record){
        titles.push(record._title_display);
      });
      return titles;
    });
    return result;
  }},
  getAllDates: {value: function() {
    var result = this.getAllRecords().then(function(records) {
      var dates = [];
      records.forEach(function(record){
        dates.push(record._date_facet);
      });
      return dates;
    });
    return result;
  }},
  getRecord: {get: function(position) {
    return element.all(by.css('.book-listing')).get(position);
  }},
  clickBookmark: { value: function(position) {
    element.all(by.css('.book-listing .bookmark')).get(position).click();
  }},
  getBookmark: { value: function(position) {
    return element.all(by.css('.bookmark')).get(position);
  }},
  selectSortMode: { value: function(position) {
    element(by.css('.record-sorting div button')).click();
    element.all(by.css('.record-sorting a')).get(position).click();
  }},
  clickRecentSearches: {value: function() {
    element.all(by.css('.records-tabs li')).get(1).click();
  }},
  getAllSearches: {value: function () {
    return element.all(by.css('.saved-searches-list .search-info'));
  }},
  getSearchTerm: {value: function(position) {
    return element.all(by.css('.search-info a')).get(position);
  }},
  clickSearch: {value: function(position) {
    element.all(by.css('.search-info a')).get(position).click();
  }},
  clickSearchByText: {value: function(text) {
    element(by.linkText(text)).click();
  }},
  removeSearch: {value: function(position) {
    element.all(by.css('.remove-search-btn')).get(position).click();
  }},
  clickViewDigitalItem: {value: function() {
    element.all(by.id('view-digital-item')).first().click();
  }}

});


module.exports = SavedRecordsPage;
