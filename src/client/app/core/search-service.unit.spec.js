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

  describe('Search Options Object', function(){
    it('should return an object with correct data structure for default Search Options', function(){
      var opts = SearchService.getDefaultOptsObj();
      expect(opts.from).toEqual(0);
      expect(opts.size).toEqual(25);
      expect(opts.q).toEqual('');
      expect(opts.sort).toEqual('relevance');
      expect(opts.facets).toEqual([]);
      expect(opts.advancedFields).toEqual([]);
      expect(opts.date).toEqual({gte: '', lte: ''});
    });

    it('should clear all search options and reset default vals when resetOpts() is called', function(){
      // create some opts
      SearchService.opts = SearchService.getDefaultOptsObj();
      SearchService.opts.q = 'painting';
      SearchService.opts.size = 100;
      SearchService.opts.from = 100;
      SearchService.opts.sort = 'date_added';
      SearchService.opts.facets.push(SearchService.buildFacet('language', 'English', 10, true));
      SearchService.opts.advancedFields.push({field: 'foo', text: 'bar'});
      SearchService.opts.date = {gte: 1520, lte: 1920};

      // reset
      SearchService.resetOpts();
      expect(SearchService.opts).toEqual(SearchService.getDefaultOptsObj());
    });
  });

  describe('Facet functions', function(){
    it('should expose facetCategoriesList array', function(){
      expect(SearchService.facetCategoriesList.length).toEqual(4);
    });
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

    describe('activateFacet', function() {
      it('should return false if invalid facet obj passed', function(){
        // isValidFacet() already unit tested so we just need to test that its being applied here.
        var badFacet = {active: true};
        expect(SearchService.activateFacet(badFacet)).toEqual(false);
      });
      it('should return false if invalid category prop in facet obj', function(){
        var badFacet = {category: 'foobar', value: 'French'};
        expect(SearchService.activateFacet(badFacet)).toEqual(false);
      });
      it('should add a new facet to opts.facets[] and set the facet.active to true', function(){
        var facet = SearchService.buildFacet('language', 'French', 10, false);
        SearchService.activateFacet(facet);
        expect(SearchService.opts.facets.length).toEqual(1);
        expect(facet.active).toEqual(true);
      });
      it('should add several new facets to opts.facets[] and set the facet.active to true', function(){
        var facet = SearchService.buildFacet('language', 'French', 10, false);
        var facetB = SearchService.buildFacet('language', 'English', 10, false);
        SearchService.activateFacet(facet);
        SearchService.activateFacet(facetB);
        expect(SearchService.opts.facets.length).toEqual(2);
        expect(facet.active).toEqual(true);
        expect(facetB.active).toEqual(true);
      });

      it('should not add  a facet to opts.facets[] if it already exists, but will set the facet.active to true', function(){
        var facet = SearchService.buildFacet('language', 'French', 10, false);
        var dupeFacet = SearchService.buildFacet('language', 'French', 10, false);
        SearchService.activateFacet(facet);
        SearchService.activateFacet(dupeFacet);
        expect(SearchService.opts.facets.length).toEqual(1);
        expect(facet.active).toEqual(true);
        expect(dupeFacet.active).toEqual(true);
      });
    });

    describe('clearFacetsIn', function(){
      var numCategories;

      it('should return false if category arg is invalid', function(){
        expect(SearchService.clearFacetsIn('foobar')).toEqual(false);
      });
      it('should clear all facets in opts.facets[]', function(){
        numCategories = SearchService.facetCategoriesList.length;

        SearchService.facetCategoriesList.forEach(function(category){
          SearchService.activateFacet( SearchService.buildFacet(category, 'foobar', 10, false) );
        });
        expect(SearchService.opts.facets.length).toEqual(numCategories);
        SearchService.clearFacetsIn('all');
        expect(SearchService.opts.facets.length).toEqual(0);
      });
      it('should clear facets in the desired category and leave facets in other categories', function(){
        numCategories = SearchService.facetCategoriesList.length;

        SearchService.facetCategoriesList.forEach(function(category){
          SearchService.activateFacet( SearchService.buildFacet(category, 'foobar', 10, false) );
        });
        expect(SearchService.opts.facets.length).toEqual(numCategories);

        SearchService.facetCategoriesList.forEach(function(category, i){
          SearchService.clearFacetsIn(category);
          expect(SearchService.opts.facets.length).toEqual(numCategories - 1 - i);
        });
      });
    });

    describe('deActivateFacet', function(){

    });
  });
});
