// spec.js
describe('Portal', function() {
  
  var searchBtn = element(by.id('go-btn'));
  var seeAllBtn = element(by.id('see-all-btn'));
  var testQuery = 'paintings';
  var bookListing = element.all(by.css('li.book-listing'));
  var resultsCount = element.all(by.css('li.book-listing')).count();
  var elems = element.all(by.tagName('html'));
  
  var urlChanged = function(url) {
  return function () {
    return browser.getCurrentUrl().then(function(actualUrl) {
      return url != actualUrl;
    });
  };
};

  browser.get('http://local.portal.dev:8000');
  it('should return all search results', function() {
    seeAllBtn.click();
    browser.wait(urlChanged("/search"), 5000);
    expect(urlChanged).toEqual('http://local.portal.dev:8000/search');
  });

  it('should return all search poop', function() {
    browser.get('http://local.portal.dev:8000');
    seeAllBtn.click().then(function() {
      browser.waitForAngular();
      expect(browser.getCurrentUrl()).toEqual('http://local.portal.dev:8000/search');
    });
  });
  
  it('should return correct search results', function() {
    browser.get('http://local.portal.dev:8000/search');
    

    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
    browser.wait(element(by.css('book-listing')).isPresent);


    expect(resultsCount).toEqual(10);
  });



  it('should return an item page', function() {
    browser.get('http://local.portal.dev:8000/search?q=' + testQuery);
    bookListing(by.css('.ng-binding a')).click();

    expect($('[ng-repeat=key, field in book._source]').toBeTruthy());
  });



});