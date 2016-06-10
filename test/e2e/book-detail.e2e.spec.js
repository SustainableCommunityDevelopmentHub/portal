// book-detail.spec.js
'use strict';

var BookDetailPage = require('../page_objects/book-detail.page.js');
var ResultsPage = require('../page_objects/results.page.js');

describe('Book Detail', function() {

  var bookDetailPage;

  beforeEach(function() {
    bookDetailPage = new BookDetailPage();
  });

  it('should return an item page with 2 entries in Type field', function() {
    element.all(by.repeater('entry in book.dublin_core.type')).then(function(types) {
      expect(types.length).toEqual(2);
      var typeElement1 = types[0].$('.book-field-val');
      var typeElement2 = types[1].$('.book-field-val');
      expect(typeElement1.getText()).toEqual('Text');
      expect(typeElement2.getText()).toEqual('printed serial');
    });
  });

  it('should download record in JSON format on click', function() {
    var testData = require('../../mocks/book.json');
    bookDetailPage.clickExport();
    $('.saveJson').click();
    var fileContents = $('.saveJson').evaluate('fileContents').then(function(data){
      return JSON.parse(data);
    });
    expect(fileContents).toEqual(testData);
  });

  it('should send user to digital item on click of view digital item', function() {
    bookDetailPage.clickViewDigitalItem();
    browser.ignoreSynchronization = true;
    expect(browser.getCurrentUrl()).toContain('http://gallica.bnf.fr/ark:/12148/bpt6k63442281');
    browser.ignoreSynchronization = false;
  });

  it('should open print dialog on click of print', function() {
    var result = browser.executeAsyncScript(function (elm, callback) {
      function listener() {
        callback(true);
      }
      window.print = listener;
      elm.click();
    }, bookDetailPage.getPrintButton().getWebElement());
    expect(result).toBe(true);
  });

  
});
