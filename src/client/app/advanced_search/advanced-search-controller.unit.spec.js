describe("Advanced Search", function(){
  var scope, searchService, controller;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('app.core');
    module('app');
    module('app.advanced-search');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_, _ADVANCED_SEARCH_, SearchService){
    $state = _$state_;
    var ADVANCED_SEARCH = _ADVANCED_SEARCH_;
    scope = $rootScope.$new();
    searchService = SearchService;
    scope.activeFacets = [];
    controller = $controller('AdvancedSearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'ADVANCED_SEARCH': ADVANCED_SEARCH,
        'SearchService': searchService
     });
    scope.fields = [
          ADVANCED_SEARCH.contributor,
          ADVANCED_SEARCH.creator,
          ADVANCED_SEARCH.date,
          ADVANCED_SEARCH.language,
          ADVANCED_SEARCH.subject,
          ADVANCED_SEARCH.type
        ];
    scope.filters = [{field: {}, text: "", lastFilter: ""}];
    spyOn(searchService, 'updateSearch');
  }));

  it("should add a new filter object when you call addFilter()", function(){
    scope.addFilter();
    expect(scope.filters.length).toBe(2);
    scope.addFilter();
    scope.addFilter();
    expect(scope.filters.length).toBe(4);

  });

  it("should set filter properties correctly", function(){
    var field = scope.fields[2];
    var filter = scope.filters[0];
    scope.selectField(filter, field);
    expect(filter.field).toEqual(field);
  });

  it("should not pass filters that don't have text to search options", function(){
    var filter = scope.filters[0];
    filter.field = scope.fields[0];
    scope.search();
    var opts = {
      q: "",
      filters: []
    };
    expect(searchService.updateSearch).toHaveBeenCalledWith(opts);
  });

  it("should add query term to search options", function(){
    scope.queryTerm = "art";
    
    scope.search();
    var opts = {
      q: scope.queryTerm,
      filters: []
    };
    expect(searchService.updateSearch).toHaveBeenCalledWith(opts);
  });

  it("should add filters to search options", function(){
    scope.queryTerm = "art";
    var filter = scope.filters[0];
    filter.field = scope.fields[0];
    filter.text = "getty";
    scope.search();
    var opts = {
      q: scope.queryTerm,
      filters: [{key: filter.field.searchKey, term: filter.text}]
    };
    expect(searchService.updateSearch).toHaveBeenCalledWith(opts);
  })
});