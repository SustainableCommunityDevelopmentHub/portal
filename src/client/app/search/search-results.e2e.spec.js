// search-results.spec.js
describe('Search Results', function() {
  

  var searchBtn = element(by.id('go-btn'));
  var seeAllBtn = element(by.id('see-all-btn'));
  var testQuery = 'paintings';

  
  beforeEach(function() {
    browser.get('');
  });

  it('should return correct search results', function() {
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
    var testQueryResults;
    $('.showing').evaluate('numTotalHits').then(function(value) {
      testQueryResults = value;
      expect(testQueryResults).toEqual(6);
    });
  });

  it('should return all search results', function() {
    seeAllBtn.click();
    var numAllResults;
    $('.showing').evaluate('numTotalHits').then(function(value) {
      numAllResults = value;
      expect(numAllResults).toEqual(452);
    });
  
  });

  it('should show decoded urls in search bar', function() {
    var urlQuery = "http://www.getty.edu/research/";
    element(by.model('queryTerm')).sendKeys(urlQuery);
    searchBtn.click();
    var searchBarText = element(by.css('.search-input')).getAttribute('value');
    expect(searchBarText).toEqual(urlQuery);
  });

  it('should display pagination at top of page', function () {
    searchBtn.click();
    var paginationBarTop = $('.results-pagination-top');
    expect(paginationBarTop.isDisplayed()).toBeTruthy();
  });

  it('should display active facets in sidebar', function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
    element.all(by.css(".left_sidebar_accordion__tab")).get(1).click();
    element(by.id("Catalogs-sidebar")).click();
    var clickedFacet = element(by.id("Catalogs-sidebar"));
    expect(clickedFacet).toBeDefined();
    expect(clickedFacet.getAttribute("value")).toEqual("on");
  });

  it('should clear facets when you uncheck them in sidebar', function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
    var numResults;
    $('.showing').evaluate('numTotalHits').then(function(value) {
      numResults = value;
    });
    element.all(by.css(".left_sidebar_accordion__tab")).get(1).click();
    element(by.id("Catalogs-sidebar")).click();
    $('.showing').evaluate('numTotalHits').then(function(value) {
      expect(value).toBeLessThan(numResults);
    });

    element(by.id("Catalogs-sidebar")).click();
    $('.showing').evaluate('numTotalHits').then(function(value) {
      expect(value).toBe(numResults);
    });
  });
});
