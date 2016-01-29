// book-detail.spec.js
describe('Book Detail', function() {

  var itemUrl = 'books/AVJ_tNi_Mia-4WJqVrEv';
  var exportBtn = element(by.id('exportBtn'));
  var testData = JSON.stringify(require('./book.json'));

  it('should return an item page', function() {
    browser.get(itemUrl);
    element.all(by.repeater('(key, field) in book._source')).then(function(posts) {
      expect(posts.length).toEqual(12);
      var titleElement = posts[11].$('.book-field-val');
      var dateElement = posts[3].$('.book-field-val');
      expect(titleElement.getText()).toEqual('La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts');
      expect(dateElement.getText()).toEqual('1896-11-21');
    });
  });

  it('should download record in JSON format on click', function(){
    browser.ignoreSynchronization = true;
    browser.get(itemUrl);
    exportBtn.click();
    $('.saveJson').click();
    var fileContents = $('.saveJson').evaluate('fileContents');
    expect(testData).toEqual(fileContents);
  });
});