describe("Sorting tests", function() {
  var scope,
      controller,
      $state,
      data,
      es,
      opts,
      SearchService,
      SavedRecordsService,
      queryBuilder,
      sortModes,
      baseESQuery;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_,  _SearchService_, _SavedRecordsService_, _DataService_, esClient, esQueryBuilder, SORT_MODES, ___){
    data = _DataService_;
    es = esClient;
    queryBuilder = esQueryBuilder;
    $state = _$state_;
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    SavedRecordsService = _SavedRecordsService_;
    sortModes = SORT_MODES;
    _ = ___;

    // reset baseESQuery
    baseESQuery = queryBuilder.buildSearchQuery({});

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': SearchService,
        'SavedRecordsService': SavedRecordsService,
        'searchResults': {}
      });
    }));

  it("should call Search Service's update opts when calling setSortMode", function(){
    spyOn(SearchService, 'updateOpts');
    scope.setSortMode(scope.validSortModes.title_asc);
    expect(SearchService.updateOpts).toHaveBeenCalled();
  });

  it("adds sort object to SearchService's options", function(){
    scope.setSortMode(scope.validSortModes.title_asc);
    expect(SearchService.opts.sort).toBeDefined();
    expect(SearchService.opts.sort).toEqual(scope.validSortModes.title_asc.mode);
  });
});
