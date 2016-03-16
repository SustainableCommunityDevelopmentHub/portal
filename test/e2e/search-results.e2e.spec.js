// search-results.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');
var BookDetailPage = require('../page_objects/book-detail.page.js');

describe('Search Results', function() {
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
  });

  it('should return correct search results', function() {
    resultsPage.submitNewSearchTerm('paintings');
    expect(resultsPage.numTotalHits).toEqual(6);
  });

  it('should show decoded urls in search bar', function() {
    resultsPage.submitNewSearchTerm("http://www.getty.edu/research/");
    expect(resultsPage.facetChips.get(0).getText()).toEqual("http://www.getty.edu/research/ (Keyword)");
  });

  it('should display pagination at top of page', function () {
    expect(resultsPage.paginationBar.isDisplayed()).toBeTruthy();
  });

  it('should display active facets in sidebar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.addFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(2);
    var option = resultsPage.getFacetOptionByLabel('subject', 'Catalogs')
    expect(option).toBeDefined();
    expect(option.getAttribute('value')).toEqual('on');
  });

  it('should clear facets when you uncheck them in sidebar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    expect(resultsPage.numTotalHits).toEqual(6);
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(2);
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(6);
  });

  it('should filter results by date when you use date range filter', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.submitDateRange('1905', '1910');
    expect(resultsPage.numTotalHits).toEqual(3);

    resultsPage.getHits().then(function(hits) {
       for(var i = 0; i < hits.length; i++){
         var date = hits[i]._date_facet;
         expect(parseInt(date)).toBeGreaterThan(1904);
         expect(parseInt(date)).toBeLessThan(1911);
       }
     });
  });

  it('should save book records', function () {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(2);
    resultsPage.submitNewSearchTerm('');
    resultsPage.submitNewSearchTerm('paintings');
    var bookmark = resultsPage.getBookMark(2);
    expect(bookmark.getAttribute('class')).toMatch('saved');
  });

  it('should remove book records', function() {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(2);
    var bookmark = resultsPage.getBookMark(2);
    var bookmarkRemoved = bookmark.getAttribute('class').then(function(classes){
      var classNames = classes.split(' ');
      return (classNames.indexOf('saved') === -1);
    });
    expect(bookmarkRemoved).toBe(true);
  });

  it('should update bookmarks for records saved in other tabs', function() {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(0);
    resultsPage.getBookMark(0).getAttribute('class').then(function(classes){
      var classNames = classes.split(' ');
      var saved = classNames.indexOf('saved');
      expect(saved).toBeGreaterThan(-1);
    });
    resultsPage.clickBookLink(0);

    browser.getAllWindowHandles().then(function (handles) {
      var newWindowHandle = handles[1]; // this is your new window

      browser.switchTo().window(newWindowHandle).then(function () {
        var bookDetailPage = new BookDetailPage();
        bookDetailPage.clickBookmark(0);
      });
    });
    browser.getAllWindowHandles().then(function(handles) {
      var newWindowHandle = handles[0];

      browser.switchTo().window(newWindowHandle).then(function () {
        expect(browser.driver.getCurrentUrl()).toContain("search");
        var bookmark = resultsPage.getBookMark(0);
        bookmark.getAttribute('class').then(function(classes){
          var classNames = classes.split(' ');
          var bookmarkRemoved = classNames.indexOf('saved') === -1;
          expect(bookmarkRemoved).toBe(true);
        });
      });
    });
  });
});
