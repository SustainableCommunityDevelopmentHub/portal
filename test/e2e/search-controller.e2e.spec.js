//search-service.e2e.spec.js
'use strict';

var HomePage = require('../page_objects/home.page.js');

describe('Search Controller', function() {
  var homePage;

  beforeEach(function() {
    homePage = new HomePage();    
  });

  it('Should load 6 sorting options in dropdown list', function() {
    homePage.submitHomePageQuery('painting');
    expect(homePage.sortOptions.count()).toEqual(6);
  });

  it('should return all search results', function() {
    homePage.seeAll();
    expect(homePage.numTotalHits).toEqual(452);
  });
  
});
