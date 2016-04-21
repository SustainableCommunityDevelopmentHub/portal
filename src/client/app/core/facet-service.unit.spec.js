/* jshint node: true */
/* global inject */

describe('FacetService Unit Tests', function(){
  var FacetService;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_FacetService_ ){
    FacetService = _FacetService_;
  }));

  describe('buildFacet', function(){
    it('should return false if buildFacet is passed an invalid category', function(){
      expect( FacetService.buildFacet('foobar', 'English') )
      .toEqual(false);
    });

    it('should return false if buildFacet is not passed a value prop', function() {
      expect( FacetService.buildFacet('language') ).toEqual(false);
    });

    it('should build a facet object and handle empty arguments for count or active', function(){
      expect( FacetService.buildFacet('language', 'English'))
      .toEqual( {category: 'language', value: 'English', count: null, active: null} );

      expect( FacetService.buildFacet('language', 'English', 6, true))
      .toEqual( {category: 'language', value: 'English', count: 6, active: true} );
    });
  });

  describe('isValidFacet', function(){
    it('should return false if facet is missing category or value, or has invalid category', function(){
      var facetA = FacetService.buildFacet('subject', 'painting', 6, true);
      expect(FacetService.isValidFacet(facetA)).toEqual(true);

      expect(FacetService.isValidFacet({category: 'foobar', value: 'painting'}))
      .toEqual(false);
      expect(FacetService.isValidFacet({category: 'subject', count: 5, active: true}))
      .toEqual(false);
    });
  });

  describe('isSameFacet', function(){
    it('should return true if facets have the same category and value and should ignore count and active properties', function(){
      var facetA = FacetService.buildFacet('subject', 'painting');
      var facetB = FacetService.buildFacet('subject', 'painting', 6, false);
      expect(FacetService.isSameFacet(facetA, facetB)).toEqual(true);
    });

    it('should return false if facets have different category or value', function(){
      var facetA = FacetService.buildFacet('subject', 'art');
      var facetB = FacetService.buildFacet('subject', 'painting', 6, false);
      expect(FacetService.isSameFacet(facetA, facetB)).toEqual(false);
    });

  });


});
