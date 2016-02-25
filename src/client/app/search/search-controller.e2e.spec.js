//search-service.e2e.spec.js

describe('Search Controller', function() {
  var searchBtn = element(by.id('go-btn'));
  var testQuery = "painting";

  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
  });

    it('Should load 6 sorting options in dropdown list', function() {
      numSortOptions = element.all(by.repeater('sortMode in validSortModes')).count();
      expect(numSortOptions).toEqual(6);
    });
});
