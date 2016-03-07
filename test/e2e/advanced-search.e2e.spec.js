describe("Advanced Search", function(){
  var testQuery = "art";

  beforeEach(function(){
    browser.get('');
    element.all(by.css('.adv')).get(0).click();

  });

  it("should search by keywords", function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    element.all(by.css('.search-btn')).get(0).click();
    var searchBar = element.all(by.css('.facet-chip a')).get(0);
    expect(searchBar.getText()).toEqual(testQuery + " (Keyword)");
    $('.showing').evaluate('numTotalHits').then(function(value) {
      expect(value).toBeGreaterThan(0);
    });
  });

  it("should search by fields", function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    element.all(by.css('.filter-dropdown')).get(0).click();
    element(by.linkText('Contributed by')).click();
    element.all(by.css('.sf-input')).get(0).sendKeys("Getty");
    element.all(by.css('.plus-button')).get(0).click();

    element.all(by.css('.filter-dropdown')).get(1).click();
    element(by.linkText('Date')).click();
    element.all(by.css('.sf-input')).get(1).sendKeys("1907");
    element(by.buttonText('Search')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
      var resultsMatch = true;
      hits.forEach(function(hit){
        var date = hit._date_display;
        if (date !== "1907"){
          resultsMatch = false;
          
        }
        var contributor = hit._grp_contributor;
        if (contributor.indexOf("Getty") < 0){
          resultsMatch = false;   
        }
      });
      expect(resultsMatch).toBe(true);
  });
  });

  it("should be able to apply facets after searching", function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    element.all(by.css('.search-btn')).get(0).click();

    var tab = element.all(by.css(".left_sidebar_accordion__tab")).get(1);
    tab.click();
    var facet = element(by.id("Art-sidebar"));
    facet.click();

    $('.showing').evaluate('numTotalHits').then(function(value) {
      expect(value).toEqual(35);
    });

  });

  it("should display clearable facet chips for advanced fields on search results page", function(){
    element(by.model('queryTerm')).sendKeys(testQuery);
    element.all(by.css('.filter-dropdown')).get(0).click();
    element(by.linkText('Contributed by')).click();
    element.all(by.css('.sf-input')).get(0).sendKeys("Getty");
    element(by.buttonText('Search')).click();

    var getty = element.all(by.repeater('advancedField in advancedFields')).get(0);
    expect(getty).toBeDefined();
    getty.click();

    $('.showing').evaluate('numTotalHits').then(function(value) {
      expect(value).toEqual(309);
    });
  })

});
