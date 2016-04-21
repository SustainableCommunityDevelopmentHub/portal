/* jshint node: true */
/* global inject */

describe('SearchService Unit Tests', function(){
  var SearchService;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_SearchService_ ){
    SearchService = _SearchService_;
  }));

  describe('calculatePage()', function(){
    it('should set page to one after running resetOpts()', function(){
      SearchService.resetOpts();
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it('should correctly set page to 1 if from = 0', function(){
      SearchService.opts = {
        from: 0,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it('should correctly set page when pageSize=10', function(){
      SearchService.opts = {
        from: 30,
        size: 10
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=25', function(){
      SearchService.opts = {
        from: 75,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=50', function(){
      SearchService.opts = {
        from: 150,
        size: 50
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=100', function(){
      SearchService.opts = {
        from: 300,
        size: 100
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize > from and does not divide evenly into from', function(){
      SearchService.opts = {
        from: 20,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(2);
    });
    it('should correctly set page when pageSize < from and does not divide evenly into from', function(){
      SearchService.opts = {
        from: 25,
        size: 10
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
  });

  describe('Facet functions', function(){
    describe('buildFacet', function(){
      it('should return false if buildFacet is passed an invalid category', function(){
        expect( SearchService.buildFacet('foobar', 'English') )
        .toEqual(false);
      });

      it('should return false if buildFacet is not passed a value prop', function() {
        expect( SearchService.buildFacet('language') ).toEqual(false);
      });

      it('should build a facet object and handle empty arguments for count or active', function(){
        expect( SearchService.buildFacet('language', 'English'))
        .toEqual( {category: 'language', value: 'English', count: null, active: null} );

        expect( SearchService.buildFacet('language', 'English', 6, true))
        .toEqual( {category: 'language', value: 'English', count: 6, active: true} );
      });
    });

    describe('isValidFacet', function(){
      it('should return false if facet is missing category or value, or has invalid category', function(){
        var facetA = SearchService.buildFacet('subject', 'painting', 6, true);
        expect(SearchService.isValidFacet(facetA)).toEqual(true);

        expect(SearchService.isValidFacet({category: 'foobar', value: 'painting'}))
        .toEqual(false);
        expect(SearchService.isValidFacet({category: 'subject', count: 5, active: true}))
        .toEqual(false);
      });
    });

    describe('isSameFacet', function(){
      it('should return true if facets have the same category and value and should ignore count and active properties', function(){
        var facetA = SearchService.buildFacet('subject', 'painting');
        var facetB = SearchService.buildFacet('subject', 'painting', 6, false);
        expect(SearchService.isSameFacet(facetA, facetB)).toEqual(true);
      });

      it('should return false if facets have different category or value', function(){
        var facetA = SearchService.buildFacet('subject', 'art');
        var facetB = SearchService.buildFacet('subject', 'painting', 6, false);
        expect(SearchService.isSameFacet(facetA, facetB)).toEqual(false);
      });
    });
  });
});
