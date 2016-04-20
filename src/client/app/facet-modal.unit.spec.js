/* jshint node: true */
/* jshint jasmine: true */
/* global inject, mockData */

describe("Facet modal", function(){
  var myScope, controller, modalInstance, mySearchService, mockResults;
  var category = 'subject';

  beforeAll(function(){
    mockResults = mockData.getMockSimpleSearchRes();
  });

  beforeEach(function(){
    module('app');
  });

  beforeEach(inject(function($rootScope, $controller, SearchService, $httpBackend){
    myScope = $rootScope.$new();
    mySearchService = SearchService;
    var results = mySearchService.setResultsData(mockResults);

    controller = $controller('FacetModalInstanceCtrl', {
      '$scope': myScope,
      '$uibModalInstance': modalInstance,
      'facets': results.facets,
      'category': category
    });

  }));

  it("should open with variables set correctly", function(){
    expect(true).toEqual(mockData.getMockSimpleSearchRes());
    expect(myScope.currentFacets).toBeDefined();
    expect(myScope.selectedFacets).toBeDefined();
    expect(myScope.categoryFacets).toBeDefined();
    expect(myScope.currentFacets.length).toBeGreaterThan(0);
    expect(myScope.isActive(category)).toBe(true);
    expect(myScope.filterCount).toBe(0);
  });

  it("should only display facets for the selected category", function(){
    var correctCategory = true;
    for(var i = 0; i < myScope.currentFacets.length; i++){
      var facet = myScope.currentFacets[i];
      if(facet.facet !== category){
        correctCategory = false;
      }
    }
    expect(correctCategory).toBe(true);
  });

  it("should switch categories correctly", function(){
    var newCategory = 'language';
    myScope.switchFacetCategory(newCategory);
    expect(myScope.isActive(newCategory)).toBe(true);
    var correctCategory = true;
    for(var i = 0; i < myScope.currentFacets.length; i++){
      var facet = myScope.currentFacets[i];
      if(facet.facet !== newCategory){
        correctCategory = false;
      }
    }
    expect(correctCategory).toBe(true);
  });

  it("should increase the filter count when a facet is checked", function(){
    var facet = {facet: 'subject', option: 'Art', count: 34, active: false};
    myScope.selectedFacets[facet.option] = true;
    myScope.checkFacet(facet);
    expect(myScope.filterCount).toBe(1);
  });

  it("should only display correct facets when user filters them", function(){
    var filterTerm = "art";
    myScope.text = filterTerm;
    myScope.searchFilters();
    var containsFilterTerm = true;
    for(var i = 0; i < myScope.currentFacets.length; i++){
      var facet = myScope.currentFacets[i];
      var facetTerm = facet.option.toLowerCase();
      if(facetTerm.indexOf(filterTerm) < 0){
        containsFilterTerm = false;
      }
    }
    expect(containsFilterTerm).toBe(true);
  });

});
