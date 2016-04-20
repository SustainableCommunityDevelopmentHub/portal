/* jshint node: true */
/* global inject, $state, spyOn */

describe("Search Controller", function(){
  var scope,
      SearchService,
      controller,
      ADVANCED_SEARCH,
      DEFAULTS,
      SORT_MODES,
      SAVED_ITEMS,
      defaultSearchObj,
      SavedRecordsService;

  var testFacet = {"category":"type","value":"Text","count":249,"active":true};
  var secondFacet = {"category":"type","value":"Image","count":53,"active":true};

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_, _ADVANCED_SEARCH_, _SearchService_, _SavedRecordsService_, _DEFAULTS_, _SORT_MODES_, _SAVED_ITEMS_){
    $state = _$state_;
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    scope.activeFacets = [];
    ADVANCED_SEARCH = _ADVANCED_SEARCH_;
    DEFAULTS = _DEFAULTS_;
    SORT_MODES = _SORT_MODES_;
    SAVED_ITEMS = _SAVED_ITEMS_;
    SavedRecordsService = _SavedRecordsService_;

    defaultSearchObj = _.merge(DEFAULTS.searchOpts, {sort: SORT_MODES[DEFAULTS.searchOpts.sort]});

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': SearchService,
        'SavedRecordsService': SavedRecordsService,
        'searchResults': {
          hits: [],
          numTotalHits: 0,
          facets: []
        }
     });
  }));

  describe("Changing page size", function(){
    it("should call updateSearch with correct page size and page number", function(){
      SearchService.opts = {
        size: 25,
        from: 0
      };

      scope.setPageSize(50);
      expect(SearchService.opts.size).toEqual(50);
    });

    it("should set page size and pageNum correctly based on size and from options", function(){
      SearchService.opts = {
        size: 25,
        from: 50
      };
      scope.setPageSize(10);
      expect(SearchService.opts.size).toEqual(10);
      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it("should set page size and pageNum correctly when an edge case", function(){
      SearchService.opts = {
        size: 10,
        from: 30
      };
      scope.setPageSize(50);
      expect(SearchService.opts.size).toEqual(50);
      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it("should set page size and pageNum correctly with a large from value", function(){
      SearchService.opts = {
        size: 10,
        from: 923
      };
      scope.setPageSize(25);
      expect(SearchService.opts.size).toEqual(25);
      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });
  });

  describe("Changing page number", function(){
    it("should set from and page number options correctly", function(){
      SearchService.opts = {
        size: 25,
        from: 10
      };
      scope.setPageNum(1);

      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it("should set opts correctly when going to next page", function(){
      SearchService.opts = {
        size: 50,
        from: 50
      };
      scope.setPageNum(3);
      expect(SearchService.opts.from).toEqual(100);
      expect(SearchService.calculatePage()).toEqual(3);
    });

    it("should set opts correctly when going back a page", function(){
      SearchService.opts = {
        size: 50,
        from: 100
      };
      scope.setPageNum(2);
      expect(SearchService.opts.from).toEqual(50);
      expect(SearchService.calculatePage()).toEqual(2);
    });

    it("should set opts correctly when going to first page", function(){
      SearchService.opts = {
        size: 25,
        from: 75
      };
      scope.setPageNum(1);
      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });
  });

  describe("Facet selection", function(){

    it("should set opts and scope vars correctly when adding a facet", function(){
      spyOn(SearchService, 'updateOpts');
      var facetOpts = {facets: scope.activeFacets, from: 0};

      scope.updateFacet(testFacet, true);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(1);
      expect(scope.activeFacets[0]).toEqual(testFacet);
    });

    it("should set page number to 1 in SearchService when adding a facet", function(){
      var facetOpts = {facets: scope.activeFacets, from: 0};

      SearchService.opts = {
        size: 25,
        from: 25
      };
      expect(SearchService.calculatePage()).toEqual(2);

      scope.updateFacet(testFacet, true);
      expect(scope.activeFacets.length).toBe(1);
      expect(scope.activeFacets[0]).toEqual(testFacet);
      expect(SearchService.opts.from).toEqual(0);
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it("should set opts and scope vars correctly when adding second facet", function(){
      spyOn(SearchService, 'updateOpts');
      var facetOpts = {facets: scope.activeFacets, from: 0};

      scope.updateFacet(testFacet, true);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(1);
      expect(scope.activeFacets[0]).toEqual(testFacet);
      scope.updateFacet(secondFacet, true);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(2);
      expect(scope.activeFacets[1]).toEqual(secondFacet);
    });

    it("should update opts and scope correctly when deactivating a particular facet", function(){
      spyOn(SearchService, 'updateOpts');
      var facetOpts = {facets: scope.activeFacets, from: 0};

      scope.updateFacet(testFacet, true);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(1);
      expect(scope.activeFacets[0]).toEqual(testFacet);
      scope.updateFacet(secondFacet, true);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(2);
      expect(scope.activeFacets[1]).toEqual(secondFacet);
      // testing deactivation, and that correct facet deactivated
      scope.updateFacet(testFacet, false);
      expect(SearchService.updateOpts).toHaveBeenCalledWith(facetOpts);
      expect(scope.activeFacets.length).toBe(1);
      expect(scope.activeFacets[0]).toEqual(secondFacet);
    });

    it("should clear advanced field facets correctly", function(){
      var gettyField = {field: ADVANCED_SEARCH.contributor, term: "getty"};
      var dateField = {field: ADVANCED_SEARCH.date, term: "1907"};
      scope.advancedFields = [gettyField, dateField];
      scope.clearAdvancedField(gettyField);
      expect(scope.advancedFields).toEqual([dateField]);
    });

    it("should toggle between active and non-active facets correctly", function(){
      var index = scope.activeFacets.indexOf(testFacet);
      // testFacet.active is false, so it should not be in scope.activeFacets
      expect(index).toBe(-1);

      // toggle facet to turn it on
      scope.toggleFacet(testFacet);
      expect(testFacet.active).toBe(true);
      index = scope.activeFacets.indexOf(testFacet);
      expect(index).toBeGreaterThan(-1);

      // toggle facet again to turn it off
      scope.toggleFacet(testFacet);
      expect(testFacet.active).toBe(false);
      index = scope.activeFacets.indexOf(testFacet);
      expect(index).toBe(-1);
    });
  });

  describe("Search Queries", function() {
    beforeEach(function(){
      //initializing vars to mimic a search
      scope.queryTerm = "art";
      SearchService.opts.q = scope.queryTerm;
    });

    it("should add new query term to previous query terms", function(){
      //adding new search term
      scope.newQuerySearch("painting");
      var newQuery = "art painting";
      expect(scope.queryTerm).toEqual(newQuery);
      expect(SearchService.opts.q).toEqual(newQuery);
    });

    it("should clear query terms correctly", function(){
      scope.clearQueryTerm();
      expect(scope.queryTerm).toEqual("");
      expect(SearchService.opts.q).toEqual("");
    });

    it("should reset page to 1 in when changing query string", function(){
      scope.clearQueryTerm();
      scope.newQuerySearch("painting");
      scope.setPageNum(2);
      expect(scope.queryTerm).toEqual("painting");
      expect(SearchService.calculatePage()).toEqual(2);

      scope.newQuerySearch("art");
      expect(scope.queryTerm).toEqual("painting art"); // currently query string appended to on change
      expect(SearchService.calculatePage()).toEqual(1);
    });

  });

  describe("Clear All functionality", function(){
    it("should clear applied facets", function(){
      scope.updateFacet(testFacet, true);

      scope.clearFacetsAndUpdate();
      expect(scope.activeFacets).toEqual([]);
      expect(SearchService.opts.facets).toEqual([]);
    });
    it("should clear all advanced search fields", function(){
      var gettyField = {field: ADVANCED_SEARCH.contributor, term: "getty"};
      scope.advancedFields = [gettyField];

      scope.clearFacetsAndUpdate();
      expect(scope.advancedFields).toEqual([]);
      expect(SearchService.opts.advancedFields).toEqual([]);
    });
  });
});
