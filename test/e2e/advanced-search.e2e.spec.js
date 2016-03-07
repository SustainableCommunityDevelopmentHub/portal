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
    expect(advancedPage.numTotalHits).toEqual(309);
  });

  it("should search by fields", function(){
    
    advancedPage.addKeywordTerm('art');
    advancedPage.addFilterSearches([
      ['Contributed by', 'Getty'],
      ['Date', '1907']]
    );
    advancedPage.submitAdvancedSearch();

    var resultsMatch = true;
    advancedPage.getHits().then(function(hits) {
      hits.forEach(function(hit){
        var date = hit._date_display;
        var contributor = hit._grp_contributor;
        if (date !== "1907" || contributor.indexOf("Getty") < 0) {
          resultsMatch = false;          
        }
      });
    });
    expect(resultsMatch).toBe(true);
  });

  it("should be able to apply facets after searching", function(){
    advancedPage.addKeywordTerm('art');
    advancedPage.submitAdvancedSearch();
    expect(advancedPage.numTotalHits).toEqual(309);
    advancedPage.addFacetOption('subject', 'Art');
    expect(advancedPage.numTotalHits).toEqual(35);
  });

  it("should display clearable facet chips for advanced fields on search results page", function(){
    advancedPage.addKeywordTerm('art');
    advancedPage.addFilterSearches([['Contributed by', 'Getty']]);
    advancedPage.submitAdvancedSearch();

    expect(advancedPage.facetChips.count()).toEqual(2);
    expect(advancedPage.getAdvancedFacetChipText(0)).toEqual('Getty (Keyword: Contributed by)');

    advancedPage.removeAdvancedFacetChip(0);
    expect(advancedPage.numTotalHits).toEqual(309);
  })

});
