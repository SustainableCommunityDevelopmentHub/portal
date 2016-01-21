// spec.js
describe('Portal', function() {
  
  var searchBtn = element(by.id('go-btn'));
  var seeAllBtn = element(by.id('see-all-btn'));
  var testQuery = 'paintings';

  it('should return correct search results', function() {
    browser.get('search');
    console.log(browser.params.baseUrl);
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
    var testQueryResults;
    $('.showing').evaluate('numTotalHits').then(function(value) {
      testQueryResults = value;
      expect(testQueryResults).toEqual(6);
    });
  });

  it('should return all search results', function() {
    browser.get('');
    seeAllBtn.click();
    var numAllResults;
    $('.showing').evaluate('numTotalHits').then(function(value) {
      numAllResults = value;
      expect(numAllResults).toEqual(446);
    });
  });

  it('should return an item page', function() {
    browser.get('books/AVIOOU1PJaRRJZcuIwVG');
    element.all(by.repeater('(key, field) in book._source')).then(function(posts) {
      expect(posts.length).toEqual(13);
      var titleElement = posts[9].$('.book-field-val');
      var dateElement = posts[0].$('.book-field-val');
      expect(titleElement.getText()).toEqual('Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York.');
      expect(dateElement.getText()).toEqual('1905');
    });
  });

});