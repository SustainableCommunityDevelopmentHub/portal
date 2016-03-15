// search-results.spec.js
/* jshint jasmine: true */
'use strict';

var ResultsPage = require('../page_objects/results.page.js');

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

  it('should display active facets in sidebar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.addFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(2);
    var option = resultsPage.getFacetOptionByLabel('subject', 'Catalogs');
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

  describe('Pagination', function(){
    beforeEach(function(){
      resultsPage.submitNewSearchTerm('');
    });

    it('should display pagination at top of page', function () {
      expect(resultsPage.paginationBar.isDisplayed()).toBeTruthy();
    });

    it('should display pagination bars at bottom of page', function () {
      expect(resultsPage.paginationBarBottom.isDisplayed()).toBeTruthy();
    });

    it("should be able to navigate to last page by clicking on 'last page' button", function(){
      resultsPage.selectLastPage();
      browser.pause();

    });

    //it("should be able to navigate to next page by clicking on 'next' button", function(){
      //resultsPage.selectNextPage();
      //browser.pause();

    //});

    it("should be able to navigate to previous page by clicking on 'next' button", function(){

    });

    it("should be able to navigate to a page by clicking on a page number button in the pagination bar", function(){

    });

  });
});
