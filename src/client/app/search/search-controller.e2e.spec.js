//search-service.e2e.spec.js

describe('SearchService e2e Tests', function() {
  var searchBtn = element(by.id('go-btn'));
  var testQuery = "painting";

  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
  });

  describe('Facets should work correctly', function(){
    it('Should be 6 sorting options in dropdown list', function() {
      numSortOptions = element.all(by.repeater('sortMode in validSortModes')).count();
      expect(numSortOptions).toEqual(6);
    });
    describe('Each facet category should work', function(){

    });

  });

});
