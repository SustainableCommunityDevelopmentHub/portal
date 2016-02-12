describe("Search Controller", function(){
  var scope, searchService, controller;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });
  
  beforeEach(inject(function($rootScope, $controller, _$state_, SearchService){
    $state = _$state_;
    scope = $rootScope.$new();
    searchService = SearchService;

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
});