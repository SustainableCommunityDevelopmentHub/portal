//search-service.e2e.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');


describe('Facet Sidebar Functionality', function() {
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('Art');
    expect(resultsPage.numTotalHits).toEqual(310);
  });
  
  describe('Facets should behave correctly', function(){
    
    describe('At least 1 facet option should exist for each category', function(){
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
      it('subject', function(){
        resultsPage.addFacetOption('subject', 'Art');
        expect(resultsPage.numTotalHits).toEqual(35);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&subject='+encodeURI('Art'));
        });
      });

      it('creator', function(){
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        expect(resultsPage.numTotalHits).toEqual(6);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&creator='+encodeURI('Bem, Eliz'));
        });
      });

      it('language', function(){
        resultsPage.addFacetOption('language', 'French');
        expect(resultsPage.numTotalHits).toEqual(205);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&language='+encodeURI('French'));
        });
      });

      it('contributing institution', function(){
        resultsPage.addFacetOption('grp_contributor', 'Heidelberg University Library');
        expect(resultsPage.numTotalHits).toEqual(100);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&grp_contributor='+encodeURI('Heidelberg University Library'));
        });
      });

    });
    
    describe('Faceting logic should be correct', function(){
      it('should behave with logical OR for 2 facets within the same category, and' + 
         'facet options inside chosen category should NOT update', function(){
        
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        resultsPage.addFacetOption('creator', 'A. Colin');
        expect(resultsPage.numTotalHits).toEqual(24);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&creator='+encodeURI('Bem, Eliz')+'&creator='+encodeURI('A. Colin'));
        });
      });
      
      it('should behave with logical AND between 2 facets in different categories, and' +
         'facet options outside chosen category should update', function(){

        resultsPage.addFacetOption('subject', 'Russia');
        resultsPage.addFacetOption('creator', 'Bem, Eliz');
        expect(resultsPage.numTotalHits).toEqual(5);
        resultsPage.getQueryString().then(function(queryString){
          expect(queryString).toEqual('q=art&from=0&size=25&sort=relevance&creator='+encodeURI('Bem, Eliz')+'&subject='+encodeURI('Russia'));
        });
      });
    });
  });
});
