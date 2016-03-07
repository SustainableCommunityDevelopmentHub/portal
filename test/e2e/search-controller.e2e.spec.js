//search-service.e2e.spec.js
'use strict';

var HomePage = require('../page_objects/home.page.js');

describe('Search Controller', function() {
  var homePage;

  //var searchBtn = element(by.id('go-btn'));
  //var testQuery = "painting";

  beforeEach(function() {
    homePage = new HomePage();
    homePage.submitHomePageQuery('painting');

    //browser.get('');
    //element(by.model('queryTerm')).sendKeys(testQuery);
    //searchBtn.click();
  });

    it('Should load 6 sorting options in dropdown list', function() {
      expect(homePage.sortOptions.count()).toEqual(6);

      //numSortOptions = element.all(by.repeater('sortMode in validSortModes')).count();
      //expect(numSortOptions).toEqual(6);
    });
});
