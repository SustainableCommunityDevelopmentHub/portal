'use strict';


var BookDetailPage = function() {
  browser.get('');
  var firstResult = element.all(by.css('.book-title')).first();
  var testQuery = 'bpt6k63442281';
  var searchBtn = element(by.id('go-btn'));
  element(by.model('queryTerm')).sendKeys(testQuery);
  searchBtn.click();
  browser.wait(function() {
    return firstResult.isPresent();
  }, 1000);
  var bookId;
  firstResult.evaluate('book._id').then(function(value) {
    bookId = value;
    var itemUrl = 'books/' + bookId;
    browser.get(itemUrl);
  });
};

BookDetailPage.prototype = Object.create({}, {
  clickBookmark: { value: function(position) {
    element.all(by.css('.bookmark')).get(position).click();
  }},
  clickExport: {value: function() {
  	element(by.id('exportBtn')).click();
  }},
  getPrintButton: {value: function(){
  	return element(by.id('printBtn'));
  }},
  clickViewDigitalItem: { value: function() {
  	element(by.id('viewDigitalItem')).click();
  }},
  clickLink: { value: function(text) {
    element(by.linkText(text)).click();
  }}
});

module.exports = BookDetailPage;