/* jshint node: true */
/* global inject, spyOn */

describe('SearchService Unit Tests', function(){
  var SearchService,
      ADVANCED_SEARCH,
      DataService;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_SearchService_ , _ADVANCED_SEARCH_, _DataService_){
    SearchService = _SearchService_;
    ADVANCED_SEARCH = _ADVANCED_SEARCH_;
    DataService = _DataService_;
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
      expect(opts.q).toEqual([]);
      expect(opts.sort).toEqual('relevance');
      expect(opts.facets).toEqual([]);
      expect(opts.advancedFields).toEqual([]);
      expect(opts.date).toEqual({gte: null, lte: null});
    });

    it('should clear all search options and reset default vals when resetOpts() is called', function(){
      // create some opts
      SearchService.opts = SearchService.getDefaultOptsObj();
      SearchService.opts.q = ['painting'];
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
    it('should expose correct facetCategoriesList array', function(){
      expect(SearchService.facetCategoriesList.length).toEqual(4);
      expect(SearchService.facetCategoriesList.indexOf('language')).toBeGreaterThan(-1);
      expect(SearchService.facetCategoriesList.indexOf('subject')).toBeGreaterThan(-1);
      expect(SearchService.facetCategoriesList.indexOf('grp_contributor')).toBeGreaterThan(-1);
      expect(SearchService.facetCategoriesList.indexOf('creator')).toBeGreaterThan(-1);
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
        .toEqual( {category: 'language', value: 'English'} );

        expect( SearchService.buildFacet('language', 'English', 10))
        .toEqual( {category: 'language', value: 'English', count: 10} );

        expect( SearchService.buildFacet('language', 'English', 6, true))
        .toEqual( {category: 'language', value: 'English', count: 6, active: true} );
      });
    });

    describe('isValidCategory', function() {
      it('should return true if facet category is valid', function() {
        expect(SearchService.isValidCategory('language')).toEqual(true);
        expect(SearchService.isValidCategory('foobar')).toEqual(false);
      });
      // check case where facet.category does not exist
      it('should return false if undefined param value passed', function() {
        var facet = {};
        expect(SearchService.isValidCategory(facet.category)).toEqual(false);
      });

    });
    describe('isValidFacet', function(){
      it('should return false if facet is missing category or value, or has invalid category', function(){
        var facetA = SearchService.buildFacet('subject', 'painting', 6, true);
        expect(SearchService.isValidFacet(facetA)).toBe(true);
        expect(SearchService.isValidFacet({category: 'foobar', value: 'painting'}))
        .toBe(false);
        expect(SearchService.isValidFacet({category: 'subject', count: 5, active: true}))
        .toBe(false);
      });
    });

    describe('isSameFacet', function(){
      it('should return true if facets have the same category and value and should ignore count and active properties', function(){
        var facetA = SearchService.buildFacet('subject', 'painting');
        var facetB = SearchService.buildFacet('subject', 'painting', 6, false);
        expect(SearchService.isSameFacet(facetA, facetB)).toEqual(true);
      });

      it('should return false if facets have different category', function(){
        var facetA = SearchService.buildFacet('subject', 'art');
        var facetB = SearchService.buildFacet('language', 'English', 6, false);
        expect(SearchService.isSameFacet(facetA, facetB)).toEqual(false);
      });

      it('should return false if facets have different value', function(){
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

        expect(SearchService.opts.facets[0].category).toEqual('language');
        expect(SearchService.opts.facets[0].value).toEqual('French');
        expect(SearchService.opts.facets[0].count).toEqual(10);
        expect(SearchService.opts.facets[0].active).toEqual(true);
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

    describe('deActivateFacet', function(){
      it('should return false if invalid facet obj passed', function(){
        // isValidFacet() already unit tested so we just need to test that its being applied here.
        var badFacet = {active: true};
        expect(SearchService.deActivateFacet(badFacet)).toEqual(false);
      });
      it('should return false if invalid category prop in facet obj', function(){
        var badFacet = {category: 'foobar', value: 'French'};
        expect(SearchService.deActivateFacet(badFacet)).toEqual(false);
      });
      it('should remove desired facet from opts.facets[] and set facet.active to false', function(){
        var facet = SearchService.buildFacet('language', 'French', 10, true);
        var facetB = SearchService.buildFacet('language', 'English', 10, true);
        SearchService.activateFacet(facet);
        SearchService.activateFacet(facetB);
        expect(SearchService.opts.facets.length).toEqual(2);

        SearchService.deActivateFacet(facet);
        expect(SearchService.opts.facets.length).toEqual(1);
        expect(facet.active).toEqual(false);
        expect(facetB.active).toEqual(true);
        SearchService.deActivateFacet(facetB);
        expect(SearchService.opts.facets.length).toEqual(0);
        expect(facetB.active).toEqual(false);
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
          var facet = SearchService.buildFacet(category, 'foobar', 10, false);
          SearchService.activateFacet(facet);
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

    describe('parseFacetsToObj', function(){
      it('should correctly build an object with a property for each facet category', function(){
        var facetCatObj = SearchService.parseFacetsToObj();
        SearchService.facetCategoriesList.forEach(function(category){
          expect(facetCatObj[category]).toBeDefined();
        });
      });
      it('should correctly populate the facet category object with active facets in each category', function(){
        SearchService.facetCategoriesList.forEach(function(category){
          SearchService.activateFacet( SearchService.buildFacet(category, 'foobar', 10, false) );
        });
        expect(SearchService.opts.facets.length).toEqual(4);

        var facetCatObj = SearchService.parseFacetsToObj();
        SearchService.facetCategoriesList.forEach(function(category){
          expect(facetCatObj[category].length).toEqual(1);
        });
      });
    });
  });

  describe('Advanced Search Functions', function() {
    it('should populate and expose advancedFieldsList array', function(){
      expect(SearchService.advancedFieldsList).toBeTruthy();
      expect(SearchService.advancedFieldsList.length).toEqual(20);
      expect(SearchService.advancedFieldsList.indexOf('language')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('subject')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('grp_contributor')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('creator')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('title')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('date')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('identifier')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('publisher')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('format')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('type')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('description')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('provenance')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('coverage')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('relation')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('source')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('rights')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('accrualMethod')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('accrualPeriodicity')).toBeGreaterThan(-1);
      expect(SearchService.advancedFieldsList.indexOf('audience')).toBeGreaterThan(-1);
    });
    it('should build advanced search field object', function(){
      var advDateFieldProps = {
        paramName: 'adv_date',
        display: 'Date'
      };

      var advField = SearchService.buildAdvancedField(ADVANCED_SEARCH.date, 1900);
      expect(advField.field).toEqual(advDateFieldProps);
      expect(advField.term).toEqual(1900);
      // test that passing string instead of object works
      advField = SearchService.buildAdvancedField('date', 1900);
      expect(advField.field).toEqual(advDateFieldProps);
      expect(advField.term).toEqual(1900);
    });
  });

  describe('buildQueryParams', function(){
    it('should build query params obj from SearchService.opts with correct q, from, and size params', function(){
      SearchService.resetOpts();
      SearchService.opts.q = 'painting';
      SearchService.opts.from = 50;
      SearchService.opts.size = 50;
      var qParams = SearchService.buildQueryParams();
      expect(qParams.q).toEqual('painting');
      expect(qParams.from).toEqual(50);
      expect(qParams.size).toEqual(50);
    });
    it('should build query params obj from SearchService.opts with correct date params', function(){
      SearchService.resetOpts();
      SearchService.opts.date = {gte: 1900, lte: 1920};
      var qParams = SearchService.buildQueryParams();
      expect(qParams.date_gte).toEqual(1900);
      expect(qParams.date_lte).toEqual(1920);
    });
    it('should build query params obj from SearchService.opts with correct facet option params', function(){
      SearchService.resetOpts();
      var catFacetVals = ['facetA', 'facetB', 'facetC', 'facetD'];
      SearchService.facetCategoriesList.forEach(function(category, i){
        SearchService.activateFacet( SearchService.buildFacet(category, catFacetVals[i], 10, false) );
      });

      var qParams = SearchService.buildQueryParams();
      SearchService.facetCategoriesList.forEach(function(category, i){
        expect(qParams[category].length).toEqual(1);
        expect(qParams[category][0]).toEqual(catFacetVals[i]);
      });
    });
    it('should build query params obj from SearchService.opts with advanced search fields option params', function(){
      SearchService.resetOpts();
      var advFieldVals = ['one', 'two', 'three', 'four', 'five', 'six'];
      SearchService.advancedFieldsList.forEach(function(props, i){
        SearchService.opts.advancedFields.push(
          SearchService.buildAdvancedField(props, advFieldVals[i])
        );
      });

      var qParams = SearchService.buildQueryParams();
      SearchService.advancedFieldsList.forEach(function(name, i){
        if (i != 6) {
          var paramVals = qParams[ ADVANCED_SEARCH[name].paramName ];
          expect(paramVals.length).toEqual(1);
          expect(paramVals[0]).toEqual(advFieldVals[i]);
        }
      });
    });
  });
});
