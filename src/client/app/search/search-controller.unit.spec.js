describe("Search Controller", function(){
  var scope, searchService, controller, ADVANCED_SEARCH;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });
  
  beforeEach(inject(function($rootScope, $controller, _$state_, _ADVANCED_SEARCH_, SearchService){
    $state = _$state_;
    scope = $rootScope.$new();
    searchService = SearchService;
    scope.activeFacets = [];
    ADVANCED_SEARCH = _ADVANCED_SEARCH_;

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': searchService
     });

    spyOn(searchService, 'updateOpts');
  }));

  describe("Changing page size", function(){
    it("should call updateSearch with correct page size and page number", function(){
      searchService.opts = {
        page: 1,
        size: 25,
        from: 0
      };
      
      scope.setPageSize(50);
      expect(searchService.updateOpts).toHaveBeenCalledWith({size: 50, page: 1});
    });

    it("should set page size and pageNum correctly based on size and from options", function(){
      searchService.opts = {
        page: 3,
        size: 25,
        from: 50
      };
      scope.setPageSize(10);
      expect(searchService.updateOpts).toHaveBeenCalledWith({size: 10, page: 6});
    });

    it("should set page size and pageNum correctly when an edge case", function(){
      searchService.opts = {
        page: 3,
        size: 10,
        from: 30
      };
      scope.setPageSize(50);
      expect(searchService.updateOpts).toHaveBeenCalledWith({size: 50, page: 2});
    });
  });

  describe("Changing page number", function(){
    it("should set from and page number options correctly", function(){
      searchService.opts = {
        page: 2, 
        size: 25,
        from: 10
      };
      scope.setPageNum(1);
      expect(searchService.updateOpts).toHaveBeenCalledWith({from: 0, page: 1});
    });

    it("should set opts correctly when going to next page", function(){
      searchService.opts = {
        page: 2, 
        size: 50,
        from: 50
      };
      scope.setPageNum(3);
      expect(searchService.updateOpts).toHaveBeenCalledWith({from: 100, page: 3});
    });

    it("should set opts correctly when going back a page", function(){
      searchService.opts = {
        page: 3, 
        size: 50,
        from: 100
      };
      scope.setPageNum(2);
      expect(searchService.updateOpts).toHaveBeenCalledWith({from: 50, page: 2});

    });
    
    it("should set opts correctly when going to first page", function(){
      searchService.opts = {
        page: 4, 
        size: 25,
        from: 75
      };
      scope.setPageNum(1);
      expect(searchService.updateOpts).toHaveBeenCalledWith({from: 0, page: 1});
    });
  });

  describe("Updating facets", function(){
    it("should set page number to 1 when adding a facet", function(){
      var testFacet = {"facet":"type","option":"Text","count":249,"active":true};
      var facetOpts = {facets: scope.activeFacets, page: 1, from: 0};
      scope.updateFacet(testFacet, true);
      expect(searchService.updateOpts).toHaveBeenCalledWith(facetOpts);
    });

    it("should clear advanced field facets correctly", function(){
      var gettyField = {field: ADVANCED_SEARCH.contributor, term: "getty"};
      var dateField = {field: ADVANCED_SEARCH.date, term: "1907"};
      scope.advancedFields = [gettyField, dateField];
      scope.clearAdvancedField(gettyField);
      expect(scope.advancedFields).toEqual([dateField]);
    });

    it("should toggle between active and non-active facets correctly", function(){
      var testFacet = {"facet":"type","option":"Text","count":249,"active":false};
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
});