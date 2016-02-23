describe("Sorting tests", function() {
  var scope, controller, $state, MySearchService, data, es, opts;

  var baseESQuery = {
    "index":"portal",
    "type":"book",
    "size":25,
    "from":"0",
    "body":{
      "query":{
        "filtered":{
          "query":{
            "match_all":{}
          },
          "filter": {
            "bool": {
              "must": [],
              "filter": []
            }
          }
        }
      },
      "aggregations":{
        "creator":{
            "terms":{
              "field":"_creator_facet.raw"
            }
          },
          "language":{
            "terms":{
              "field":"_language"
            }
          },
          "grp_contributor":{
            "terms":{
              "field":"_grp_contributor.raw"
            }
          },
          "subject":{
            "terms":{
              "field":"_subject_facets.raw"
            }
          },
          "type":{
            "terms":{
              "field":"_grp_type.raw"
            }
          }
        }
      }
    
  };

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });
  
  beforeEach(inject(function($rootScope, $controller, _$state_, SearchService, DataService, esClient){
    data = DataService;
    es = esClient;
    $state = _$state_;
    scope = $rootScope.$new();
    searchService = SearchService;

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
      spyOn(es, 'search');

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
      titleQuery.body.sort = "_title_display.sort";

      data.search(opts);
      expect(es.search).toHaveBeenCalledWith(titleQuery);
    
    });

    it("builds correct elasticsearch query for title descending sorting", function(){
      opts.sort = scope.validSortModes.titleZA;
      var titleDescQuery = baseESQuery;
      titleDescQuery.body.sort = {"_title_display.sort": {"order": "desc"}};

      data.search(opts);

      expect(es.search).toHaveBeenCalledWith(titleDescQuery);
    });

    it("builds correct elasticsearch query for date added", function() {
      opts.sort = scope.validSortModes.dateAdded;
      var dateAddedQuery = baseESQuery;
      dateAddedQuery.body.sort = {"_ingest_date": {"order": "desc"}};

      data.search(opts);
      expect(es.search).toHaveBeenCalledWith(dateAddedQuery);
    });

    it("builds correct elasticsearch query for publication date ascending", function() {
      opts.sort = scope.validSortModes.dateAscend;
      var dateAscQuery = baseESQuery;
      dateAscQuery.body.sort = "_date_facet";

      data.search(opts);
      expect(es.search).toHaveBeenCalledWith(dateAscQuery);
    });

    it("builds correct elasticsearch query for publication date descending", function(){
      opts.sort = scope.validSortModes.dateDesc;
      var dateDescQuery = baseESQuery;
      dateDescQuery.body.sort = { "_date_facet": {"order": "desc"}};

      data.search(opts);
      expect(es.search).toHaveBeenCalledWith(dateDescQuery)
    });

    it("does not build an elasticsearch query for relevance", function() {
      opts.sort = scope.validSortModes.relevance;
      data.search(opts);
      expect(es.search).toHaveBeenCalledWith(baseESQuery);
    });

  });

});