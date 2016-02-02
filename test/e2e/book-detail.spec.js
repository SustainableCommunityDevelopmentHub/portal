// book-detail.spec.js
describe('Book Detail', function() {

  
  var seeAllBtn = element(by.id('see-all-btn'));
  var firstResult = element.all(by.css('.portal-record-link')).first();
  var exportBtn = element(by.id('exportBtn'));
  var testData = JSON.stringify(require('./book.json'));
    
  
  beforeEach(function() {
    browser.get('');
    seeAllBtn.click();
    browser.wait(function() {
      return firstResult.isPresent();
    }, 1000);
    var bookId;
    firstResult.evaluate('book._id').then(function(value) {
      bookId = value;
      var itemUrl = 'books/' + bookId;
      browser.get(itemUrl);
    });
  });

  it('should return an item page', function() {
    element.all(by.repeater('(key, field) in book._source.dublin_core')).then(function(posts) {
      expect(posts.length).toEqual(12);
      var titleElement = posts[11].$('.book-field-val');
      var dateElement = posts[3].$('.book-field-val');
      expect(titleElement.getText()).toEqual('La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts');
      expect(dateElement.getText()).toEqual('1896-11-21');
    });
  });

  it('should download record in JSON format on click', function() {
    exportBtn.click();
    $('.saveJson').click();
    var fileContents = $('.saveJson').evaluate('fileContents');
    expect(testData).toEqual(fileContents);
  });

  
});