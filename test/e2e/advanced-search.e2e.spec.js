'use strict';

var AdvancedPage = require('../page_objects/advanced.page.js');


describe("Advanced Search", function(){
  var advancedPage;

  var testQuery = "art";

  beforeEach(function(){
    advancedPage = new AdvancedPage();
  });

  it("should search by keywords", function(){
    advancedPage.addKeywordTerm('art');
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.facetChips.get(0).getText()).toEqual('art (Keyword)');
    expect(advancedPage.numTotalHits).toEqual(310);
  });

  it("should submit search with enter button", function() {
    advancedPage.addKeywordTerm('art');
    advancedPage.submitWithEnterBtn();
    expect(advancedPage.facetChips.get(0).getText()).toEqual('art (Keyword)');
    expect(advancedPage.numTotalHits).toEqual(310);
  });

  it("should search by fields", function(){

    advancedPage.addKeywordTerm('art');
    advancedPage.addFilterSearches([
      ['From', 'Getty'],
      ['Date', '1907']]
    );
    advancedPage.submitAdvancedSearch();

    var resultsMatch = true;
    advancedPage.getHits().then(function(hits) {
      hits.forEach(function(hit){
        var facet_date = hit._date_facet.folded;
        var dates = hit.dublin_core.date;
        dates.forEach(function(date){
          if (facet_date !== "1907" && date.value !== "1907"){
            resultsMatch = false;
          }
        });

        var contributor = hit._grp_contributor;
        if (contributor.indexOf("Getty") < 0){
          resultsMatch = false;
        }
      });
    });
    expect(resultsMatch).toBe(true);
  });

  it("should submit search fields with enter button", function() {
    advancedPage.addKeywordTerm('art');
    advancedPage.addFilterSearches([
      ['From', 'Getty'],
      ['Date', '1907']]
    );
    advancedPage.submitFiltersWithEnter();
    expect(advancedPage.facetChips.get(0).getText()).toEqual('art (Keyword)');
    expect(advancedPage.facetChips.get(1).getText()).toEqual('Getty (Keyword: From)');
    expect(advancedPage.facetChips.get(2).getText()).toEqual('1907 (Keyword: Date)');
    advancedPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&adv_date=1907&adv_grp_contributor=Getty');
    });
  });

  it("should, going to advanced search from search results, clear any pre-existing Search Options before searching", function(){
    // execute normal search, takes us to Search Results page, apply date filter
    advancedPage.submitAdvancedSearch();
    advancedPage.submitDateRange(1900, 1920);
    expect(advancedPage.numTotalHits).toEqual(125);
    expect(advancedPage.facetChips.count()).toEqual(1);

    // execute advanced search, confirm previously applied search opt is gone
    advancedPage.clickAdvancedSearchLink();
    advancedPage.addFilterSearches([['Language', 'English']]);
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.numTotalHits).toEqual(45);
    expect(advancedPage.facetChips.count()).toEqual(1);
  });

  it("should, going directly to advanced search, clear any pre-existing Search Options before searching", function(){
    // execute normal search, takes us to Search Results page, apply date filter
    advancedPage.submitAdvancedSearch();
    advancedPage.submitDateRange(1900, 1920);
    expect(advancedPage.numTotalHits).toEqual(125);
    expect(advancedPage.facetChips.count()).toEqual(1);

    // execute advanced search, confirm previously applied search opt is gone
    browser.get('/advanced');
    advancedPage.addFilterSearches([['Language', 'English']]);
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.numTotalHits).toEqual(45);
    expect(advancedPage.facetChips.count()).toEqual(1);
    advancedPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('from=0&size=25&sort=relevance&adv_language=English');
    });
  });

  it("should be able to apply facets after searching", function(){
    advancedPage.addKeywordTerm('art');
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.numTotalHits).toEqual(310);
    advancedPage.addFacetOption('subject', 'Art');
    expect(advancedPage.numTotalHits).toEqual(35);
  });

  it("should display clearable facet chips for advanced fields on search results page", function(){
    advancedPage.addKeywordTerm('art');
    advancedPage.addFilterSearches([['From', 'Getty']]);
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.facetChips.count()).toEqual(2);
    advancedPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&adv_grp_contributor=Getty');
    });

    var chip = advancedPage.advancedFacetChips.get(0);
    expect(chip.getText()).toEqual('Getty (Keyword: From)');

    chip.click();
    expect(advancedPage.numTotalHits).toEqual(310);
    advancedPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance');
    });
  });

  it('should clear out previous advanced fields completely', function() {
    advancedPage.addFilterSearches([['From', 'Getty']]);

    advancedPage.submitAdvancedSearch();

    var advancedFields = advancedPage.advancedFacetChips;
    advancedFields.get(0).click();

    advancedPage.submitNewSearchTerm('art');
    expect(advancedPage.advancedFacetChips.count()).toEqual(0);
    expect(advancedPage.facetChips.count()).toEqual(1);
    advancedPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance');
    });
  });


});
