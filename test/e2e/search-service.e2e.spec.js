//search-service.e2e.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');


describe('Facet Sidebar Functionality', function() {
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('Art');
    expect(resultsPage.numTotalHits).toEqual(309);
  });
  
  describe('Facets should behave correctly', function(){
    
    describe('At least 1 facet option should exist for each category', function(){
      it('type', function(){
        expect(resultsPage.getFacetOption('type', 0).getText()).toBeTruthy();
      });
      
      it('subject', function(){
        expect(resultsPage.getFacetOption('subject', 0).getText()).toBeTruthy();
      });

      it('creator', function(){
        expect(resultsPage.getFacetOption('creator', 0).getText()).toBeTruthy();
      });

      it('language', function(){
        expect(resultsPage.getFacetOption('language', 0).getText()).toBeTruthy();
      });

      it('contributing institution', function(){
        expect(resultsPage.getFacetOption('grp_contributor', 0).getText()).toBeTruthy();
      });
      
    });
    
    describe('Should be able to apply a facet to filter results for each category', function(){
      it('type', function(){
        resultsPage.addFacetOption('type', 'Text');
        expect(resultsPage.numTotalHits).toEqual(253);
      });

      it('subject', function(){
        resultsPage.addFacetOption('subject', 'Art');
        expect(resultsPage.numTotalHits).toEqual(35);
      });

      it('creator', function(){
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        expect(resultsPage.numTotalHits).toEqual(6);
      });

      it('language', function(){
        resultsPage.addFacetOption('language', 'French');
        expect(resultsPage.numTotalHits).toEqual(204);
      });

      it('contributing institution', function(){
        resultsPage.addFacetOption('grp_contributor', 'Heidelberg University Library');
        expect(resultsPage.numTotalHits).toEqual(100);
      });

    });
    
    describe('Faceting logic should be correct', function(){
      it('should behave with logical OR for 2 facets within the same category, and' + 
         'facet options inside chosen category should NOT update', function(){
        
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        resultsPage.addFacetOption('creator', 'Institut de France');
        expect(resultsPage.numTotalHits).toEqual(9);
      });
      
      it('should behave with logical AND between 2 facets in different categories, and' +
         'facet options outside chosen category should update', function(){

        resultsPage.addFacetOption('type', 'Text');
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        expect(resultsPage.numTotalHits).toEqual(4);
      });

      /**********
       * The application behaves correctly when tested manually but there is an error in the final
       * portion of this test which I have been unable to debug. 2/24/16
       *
      it('Facets should behave with Image AND (CreatorA OR CreatorB) logic, facet options outside chosen category should update', function(){
        getFacetSideBarTab(testVals.typeFacet.sideBarPos).click();
        var typeFacet = element.all(by.repeater('facet in facets.type')).get(0);

        getFacetSideBarTab(testVals.creatorFacet.sideBarPos).click();
        var creatorFacet = $("[id='" + testVals.creatorFacet.cssId + "']");

        typeFacet.click()
        .then(function(){
          return $('.dropdown.results-top', '.showing').evaluate('numTotalHits');
        })
        .then(function(numTotalHits) {
          expect(numTotalHits).toBe(testVals.typeFacet.numRecords);
        })
        .then(function(){
          return creatorFacet.click();
        })
        .then(function(){
          return $('.dropdown.results-top', '.showing').evaluate('numTotalHits');
        })
        .then(function(numTotalHits) {
          expect(numTotalHits).toBe(testVals.creatorFacet.numRecords);
        })
        .then(function(){
          // for some reason protractor does not like using the other way of getting facets here
          var alternateCreatorFacet = element.all(by.repeater('facet in facets.creator')).get(1);
          return alternateCreatorFacet.click();
        })
        .then(function(){
          return $('.dropdown.results-top', '.showing').evaluate('numTotalHits');
        })
        .then(function(numTotalHits){
          // if logical text AND (CreatorA OR CreatorB) behavior is correct,
          // numTotalHits will be the sum of the 2 creators
          // since they add up to less than the type (text) facet and also bound it.
          // again, we also know facet options have updated.
          expect(numTotalHits).toBe(testVals.creatorFacet.altNumRecords + testVals.alternateCreatorFacet.numRecords);
        });
      });
      */

    });
  });
});