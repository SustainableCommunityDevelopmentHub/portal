//search-service.e2e.spec.js

describe('SearchService e2e Tests', function() {
  var searchBtn = element(by.id('go-btn'));
  var testQuery = "painting";

  /*  get el for facet sidebar tab
   * @param {integer} position position of the tab, from 0-4, top-bottom
   * @return {object} the element in question, to be further manipulated
   */
  function getFacetSideBarTab(position){
    return element.all(by.css(".left_sidebar_accordion__tab")).get(position);
  }

  /* get el for a facet option in a facet sidebar
   * @param {string} category name of facet category (check SearchCtrl.$scope.facets for list)
   * @param {integer} optionPos position of desired facet option in array
   * @return {object} the el of facet option in question, to be further manipulated
   */
  function getFacetOptionIn(category, optionPos){
    getFacetSideBarTab(2).click();
    return element.all(by.repeater('facet in facets.' + category)).get(optionPos);
  }

  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
  });

  describe('Facets should work correctly, and work with a query term', function(){
    describe('At least 1 facet option should exist for each category', function(){
      it('type', function(){
        var firstFacet = getFacetOptionIn('type', 0);
        expect(firstFacet).toBeTruthy();

      });
      it('subject', function(){
        var firstFacet = getFacetOptionIn('subject', 0);
        expect(firstFacet).toBeTruthy();
      });
      it('creator', function(){
        var firstFacet = getFacetOptionIn('creator', 0);
        expect(firstFacet).toBeTruthy();
      });
      it('language', function(){
        var firstFacet = getFacetOptionIn('language', 0);
        expect(firstFacet).toBeTruthy();
      });
      it('contributing institution', function(){
        var firstFacet = getFacetOptionIn('grp_contributor', 0);
        expect(firstFacet).toBeTruthy();
      });
    });

    describe('Should be able to apply a facet for each category', function(){
      it('type', function(){
        getFacetSideBarTab(0).click();
        var firstFacet = element.all(by.repeater('facet in facets.type')).get(0);
        var firstFacetText = firstFacet.getText();

        console.log('FIRST FACET TEXT ' + firstFacetText);
        expect(firstFacetText).toBeTruthy();
        firstFacet.click();
        //var facetNumRecords = String(firstFacetText).split('(')[1];
        //var facetNumRecords = String(firstFacetText).split('(')[1].slice(0, -1);
        //browser.pause();



      });
      it('subject', function(){
        getFacetSideBarTab(1).click();
        var firstFacet = element.all(by.repeater('facet in facets.subject')).get(0);
        var firstFacetText = firstFacet.getText();
        expect(firstFacetText).toBeTruthy();
      });
      it('creator', function(){
        getFacetSideBarTab(2).click();
        var firstFacet = element.all(by.repeater('facet in facets.creator')).get(0);
        var firstFacetText = firstFacet.getText();
        expect(firstFacetText).toBeTruthy();
      });
      it('language', function(){
        getFacetSideBarTab(3).click();
        var firstFacet = element.all(by.repeater('facet in facets.language')).get(0);
        var firstFacetText = firstFacet.getText();
        expect(firstFacetText).toBeTruthy();
      });
      it('contributing institution', function(){
        getFacetSideBarTab(4).click();
        var firstFacet = element.all(by.repeater('facet in facets.grp_contributor')).get(0);
        var firstFacetText = firstFacet.getText();
        expect(firstFacetText).toBeTruthy();
      });

    });

  });

});
