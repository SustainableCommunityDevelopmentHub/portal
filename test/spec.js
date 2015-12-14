// spec.js
describe('Portal', function() {
  
  var searchBtn = element(by.id('go-btn'));
  var seeAllBtn = element(by.id('see-all-button'));
  var testQuery = 'paintings';
  var bookListing = element.all(by.css('li.book-listing'));
  var resultsCount = element.all(by.css('li.book-listing')).count();

  beforeEach(function() {
    browser.get('http://local.portal.dev:8000');
  });

  it('should return correct search results', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();

    expect(Results.hits.hits.count()).toEqual(resultsCount);
  });

  it('should return all search results', function() {
    browser.get('http://local.portal.dev:8000');
    seeAllBtn.click();

    expect(browser.getCurrentUrl()).toEqual('http://local.portal.dev:8000/search');
  });

  it('should return an item page', function() {
    browser.get('http://local.portal.dev:8000/search?q=' + testQuery);
    bookListing.element(by.css('.ng-binding a')).click();

    expect($('[ng-repeat=key, field in book._source]').toBeTruthy());
  });


  afterEach(function() {
    browser.refresh();
  });
});