
describe("Facet modal", function(){
  var scope, controller, modalInstance, mySearchService, mockResults;
  var category = 'subject';

  beforeAll(function(){
    mockResults = mockData.getMockSimpleSearchRes();
  });

  beforeEach(function(){
    module('app');
  });

  beforeEach(inject(function($rootScope, $controller, SearchService, $httpBackend){
    scope = $rootScope.$new();
    mySearchService = SearchService;
    var results = mySearchService.setResultsData(mockResults);

    controller = $controller('FacetModalInstanceCtrl', {
      '$scope': scope,
      '$uibModalInstance': modalInstance,
      'facets': results.facets,
      'category': category
    });

  }));

  it("should open with variables set correctly", function(){
    expect(scope.currentFacets).toBeDefined();
    expect(scope.selectedFacets).toBeDefined();
    expect(scope.categoryFacets).toBeDefined();
    expect(scope.currentFacets.length).toBeGreaterThan(0);
    expect(scope.isActive(category)).toBe(true);
    expect(scope.filterCount).toBe(0);
  });

  it("should only display facets for the selected category", function(){
    var correctCategory = true;
    for(var i = 0; i < scope.currentFacets.length; i++){
      var facet = scope.currentFacets[i];
      if(facet.facet != category){
        correctCategory = false;
      }
    }
    expect(correctCategory).toBe(true);
  });

  it("should switch categories correctly", function(){
    var newCategory = 'language';
    scope.switchFacetCategory(newCategory);
    expect(scope.isActive(newCategory)).toBe(true);
    var correctCategory = true;
    for(var i = 0; i < scope.currentFacets.length; i++){
      var facet = scope.currentFacets[i];
      if(facet.facet != newCategory){
        correctCategory = false;
      }
    }
    expect(correctCategory).toBe(true);
  });

  it("should increase the filter count when a facet is checked", function(){
    var facet = {facet: 'subject', option: 'Art', count: 34, active: false};
    scope.selectedFacets[facet.option] = true;
    scope.checkFacet(facet);
    expect(scope.filterCount).toBe(1);
  });

  it("should only display correct facets when user filters them", function(){
    var filterTerm = "art";
    scope.text = filterTerm;
    scope.searchFilters();
    var containsFilterTerm = true;
    for(var i = 0; i < scope.currentFacets.length; i++){
      var facet = scope.currentFacets[i];
      var facetTerm = facet.option.toLowerCase();
      if(facetTerm.indexOf(filterTerm) < 0){
        containsFilterTerm = false;
      }
    }
    expect(containsFilterTerm).toBe(true);
  });

});