// book-detail.spec.js
/* jshint node: true */
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
    $('.saveJson').evaluate('fileContents').then(function(response){
      var fileContents = JSON.parse(response);
      expect(fileContents).toEqual(testData);
    });    
  });

  it('should download correct RIS record on click', function() {
    var fs = require('fs');
    var path = require('path');
    var appRoot = process.cwd();
    var testData = fs.readFileSync(appRoot + '/mocks/book.ris', 'utf8');

    bookDetailPage.clickExport();
    $('.saveRis').click();

    // Get ris record data we put in the code for testing.
    // The return object from fs.readFile does not have expected String funcs like .slice()
    // ...and newLines are not in the string.
    // Had to handle inside callback like this for things to work.
    var fileContentsRis = $('.saveRis').evaluate('fileContentsRis').then(function(response){
      return response['data'].slice(
        (response['data'].indexOf('UR  - ') + 6), response['data'].indexOf('N1')
      ).trim();
    });

    // check that each record is for the same digital item
    // by implication informally checks that record is a RIS record
    expect( fileContentsRis ).toEqual( extractRisUrl(testData) );

    function extractRisUrl(risRecord){
      var urlLine = risRecord.split('\n').filter(function(line){
        if(line.split(' ')[0] === 'UR'){
          return true;
        }
      })[0].trim();
      return urlLine ? urlLine.split(' ')[3] : false;
    }
  });

  it('should send user to digital item on click of view digital item', function() {
    bookDetailPage.clickViewDigitalItem();
    browser.getAllWindowHandles().then(function (handles) {
      var newWindowHandle = handles[1]; // this is your new window
      browser.switchTo().window(newWindowHandle).then(function () {
        browser.ignoreSynchronization = true;
        expect(browser.getCurrentUrl()).toContain('http://gallica.bnf.fr/ark:/12148/bpt6k63442281');
        browser.ignoreSynchronization = false;
      });
    });

  });

  it('should send user to digital item on click of title', function() {
    bookDetailPage.clickTitle();
    browser.getAllWindowHandles().then(function (handles) {
      var newWindowHandle = handles[1]; // this is your new window

      browser.switchTo().window(newWindowHandle).then(function () {
        browser.ignoreSynchronization = true;
        expect(browser.getCurrentUrl()).toContain('http://gallica.bnf.fr/ark:/12148/bpt6k63442281');
        browser.ignoreSynchronization = false;
      });
    });

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

  it('should run a search after clicking contributor link', function() {
    bookDetailPage.clickLink('Houssaye, Édouard. Directeur de publication');
    element.all(by.css('.showing')).get(0).evaluate('numTotalHits').then(function(hits) {
      expect(hits).toEqual(77);
    });
  });

  it('should run a search after clicking language link', function() {
    bookDetailPage.clickLink('French');
    element.all(by.css('.showing')).get(0).evaluate('numTotalHits').then(function(hits) {
      expect(hits).toEqual(270);
    });
  });

  it('should run a search after clicking from link', function() {
    bookDetailPage.clickLink('Gallica - Bibliothèque nationale de France');
    element.all(by.css('.showing')).get(0).evaluate('numTotalHits').then(function(hits) {
      expect(hits).toEqual(100);
    });
  });


});
