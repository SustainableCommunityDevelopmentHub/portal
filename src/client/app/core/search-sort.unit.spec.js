describe("Sorting tests", function() {
  var scope,
      controller,
      $state,
      MySearchService,
      data,
      es,
      opts,
      queryBuilder,
      baseESQuery;

  //var baseESQuery = {
    //"index":"portal",
    //"type":"book",
    //"size":25,
    //"from":"0",
    //"body":{
      //"query":{
        //"filtered":{
          //"query":{
            //"match_all":{}
          //},
          //"filter": {
            //"bool": {
              //"must": [],
              //"filter": []
            //}
          //}
        //}
      //},
      //"aggregations":{
        //"creator":{
            //"terms":{
              //"field":"_creator_facet.raw"
            //}
          //},
          //"language":{
            //"terms":{
              //"field":"_language"
            //}
          //},
          //"grp_contributor":{
            //"terms":{
              //"field":"_grp_contributor.raw"
            //}
          //},
          //"subject":{
            //"terms":{
              //"field":"_subject_facets.raw"
            //}
          //},
          //"type":{
            //"terms":{
              //"field":"_grp_type.raw"
            //}
          //}
        //}
      //}

  //};

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_, SearchService, DataService, esClient, esQueryBuilder, SORT_MODES, ___){
    data = DataService;
    es = esClient;
    queryBuilder = esQueryBuilder;
    $state = _$state_;
    scope = $rootScope.$new();
    searchService = SearchService;
    sortModes = SORT_MODES,
    _ = ___;

    // reset baseESQuery
    baseESQuery = queryBuilder.buildSearchQuery({});

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': searchService
      });
    }));

  it("should call Search Service's update opts when calling setSortMode", function(){
    spyOn(searchService, 'updateOpts');
    scope.setSortMode(scope.validSortModes.titleAZ);
    expect(searchService.updateOpts).toHaveBeenCalled();
  });

  it("adds sort object to SearchService's options", function(){
    scope.setSortMode(scope.validSortModes.titleAZ);
    expect(searchService.opts.sort).toBeDefined();
    expect(searchService.opts.sort).toEqual(scope.validSortModes.titleAZ);
  });

  describe("Tests for building elasticsearch sort queries", function(){
    beforeEach(function(){
      opts = {"facets":[],"page":1,"from":'0', size: 25};
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
      opts.sort = scope.validSortModes.titleAZ;
      var titleQuery = baseESQuery;
      titleQuery.body.sort = sortModes.titleAZ.sortQuery;

      data.search(opts);

      // NOTE: Strange comparison errs, 0 integer being cast to string somewere.
      // And lodash _.isEqual() will return true when appropriate while jasmine's .toEqual() fails
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, titleQuery.body)).toEqual(true);


    });

    it("builds correct elasticsearch query for title descending sorting", function(){
      opts.sort = scope.validSortModes.titleZA;
      var titleDescQuery = baseESQuery;
      titleDescQuery.body.sort = sortModes.titleZA.sortQuery;

      data.search(opts);

      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, titleDescQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for date added", function() {
      opts.sort = scope.validSortModes.dateAdded;
      var dateAddedQuery = baseESQuery;
      dateAddedQuery.body.sort = sortModes.dateAdded.sortQuery;

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateAddedQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for publication date ascending", function() {
      opts.sort = scope.validSortModes.dateAscend;
      var dateAscQuery = baseESQuery;
      dateAscQuery.body.sort = sortModes.dateAscend.sortQuery;

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateAscQuery.body)).toEqual(true);
    });

    it("builds correct elasticsearch query for publication date descending", function(){
      opts.sort = scope.validSortModes.dateDesc;
      var dateDescQuery = baseESQuery;
      dateDescQuery.body.sort = { "_date_facet": {"order": "desc"}};

      data.search(opts);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, dateDescQuery.body)).toEqual(true);
    });

    it("does not build an elasticsearch query for relevance", function() {
      opts.sort = scope.validSortModes.relevance;
      data.search(opts);
      //expect(queryBuilder.transformToMultiSearchQuery).toHaveBeenCalledWith(baseESQuery);
      var actualQueryBody = queryBuilder.transformToMultiSearchQuery.calls.mostRecent().args[0].body;
      expect(_.isEqual(actualQueryBody, baseESQuery.body)).toEqual(true);
    });

  });

});
