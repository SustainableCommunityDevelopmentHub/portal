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
      expect(numAllResults).toEqual(446);
    });
  
  });

  it('should show decoded urls in search bar', function() {
    var urlQuery = "http://www.getty.edu/";
    element(by.model('queryTerm')).sendKeys(urlQuery);
    searchBtn.click();
    var searchBarText = element(by.css('.search-input')).getAttribute('value');
    expect(searchBarText).toEqual(urlQuery);
  });
});