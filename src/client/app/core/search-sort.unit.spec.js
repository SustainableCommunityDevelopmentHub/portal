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

  describe("Tests for building elasticsearch sort queries", function(){
    beforeEach(function(){
      opts = {"facets":[]};
      spyOn(queryBuilder, 'transformToMultiSearchQuery');

    });

    afterEach(function(){
      /* Tear down properly so state does not persiste between tests */
      delete opts.sort;
      if(baseESQuery.body.sort){
        delete baseESQuery.body.sort;
      }
    });

    it("builds correct elasticsearch query for title sorting", function(){
      opts.sort = scope.validSortModes.title_asc.mode;
      var titleQuery = baseESQuery;
      titleQuery.body.sort = sortModes.title_asc.sortQuery;

      data.search(opts);

      // NOTE: Strange comparison errs, 0 integer being cast to string somewere.
      // And lodash _.isEqual() will return true when appropriate while jasmine's .toEqual() fails
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      //expect(_.isEqual(actualQueryBody, titleQuery.body)).toEqual(true);
      expect(actualQueryBody).toEqual(titleQuery.body);


    });

    it("builds correct elasticsearch query for title descending sorting", function(){
      opts.sort = scope.validSortModes.title_desc.mode;
      var titleDescQuery = baseESQuery;
      titleDescQuery.body.sort = sortModes.title_desc.sortQuery;

      data.search(opts);

      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, titleDescQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for date added", function() {
      opts.sort = scope.validSortModes.date_added.mode;
      var dateAddedQuery = baseESQuery;
      dateAddedQuery.body.sort = sortModes.date_added.sortQuery;

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateAddedQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for publication date ascending", function() {
      opts.sort = scope.validSortModes.date_asc.mode;
      var dateAscQuery = baseESQuery;
      dateAscQuery.body.sort = sortModes.date_asc.sortQuery;

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateAscQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for publication date descending", function(){
      opts.sort = scope.validSortModes.date_desc.mode;
      var dateDescQuery = baseESQuery;
      dateDescQuery.body.sort = { "_date_facet": {"order": "desc"}};

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateDescQuery.body)).toEqual(true);
    });

    it("does not build an elasticsearch query for relevance", function() {
      opts.sort = scope.validSortModes.relevance.mode;
      data.search(opts);
      //expect(queryBuilder.transformToMultiSearchQuery).toHaveBeenCalledWith(baseESQuery);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, baseESQuery.body)).toEqual(true);
    });

  });

});
