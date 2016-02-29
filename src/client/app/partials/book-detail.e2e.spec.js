// book-detail.spec.js
describe('Book Detail', function() {

  
  var searchBtn = element(by.id('go-btn'));
  var firstResult = element(by.css('.digital-item-link'));
  var exportBtn = element(by.id('exportBtn'));
  var testData = JSON.stringify(require('../../../../mocks/book.json'));
  var testQuery = 'bpt6k63442281';
    
  
  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
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

  it('should return an item page with 2 entries in Type field', function() {
    element.all(by.repeater('entry in book._source.dublin_core.type')).then(function(types) {
      expect(types.length).toEqual(2);
      var typeElement1 = types[0].$('.book-field-val');
      var typeElement2 = types[1].$('.book-field-val');
      expect(typeElement1.getText()).toEqual('Text');
      expect(typeElement2.getText()).toEqual('printed serial');
    });
  });

  it('should download record in JSON format on click', function() {
    exportBtn.click();
    $('.saveJson').click();
    var fileContents = $('.saveJson').evaluate('fileContents');
    expect(fileContents).toEqual(testData);
  });

  
});
