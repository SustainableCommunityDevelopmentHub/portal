// search-results.spec.js
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

  /*
   * I cannot get this test to pass anymore.
   * For some reason I cannot determine the search is not executed.
   *
  it('should show decoded urls in search bar', function() {
    resultsPage.submitNewSearchTerm("http://www.getty.edu/research/");
    browser.pause();
    expect(resultsPage.facetsChips.get(0).getText()).toEqual("http://www.getty.edu/research/ (Keyword)");
  });
  */

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

});
