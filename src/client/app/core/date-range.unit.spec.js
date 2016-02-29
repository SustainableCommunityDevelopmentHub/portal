describe("Date Range Filter", function() {
  var scope, controller, $state, MySearchService, data, es, opts, queryBuilder;

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
  
  beforeEach(inject(function($rootScope, $controller, _$state_, SearchService, DataService, esClient, esQueryBuilder){
    data = DataService;
    es = esClient;
    $state = _$state_;
    scope = $rootScope.$new();
    searchService = SearchService;
    queryBuilder = esQueryBuilder;

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': searchService
      });
    }));

  it("should call Search Service's update opts when calling setDateRange", function(){
    spyOn(searchService, 'updateOpts');
    scope.setDateRange(scope.fromDate, scope.toDate);
    expect(searchService.updateOpts).toHaveBeenCalled();
  });

  it("adds date range object to SearchService's options", function(){
    scope.setDateRange(scope.fromDate, scope.toDate);
    expect(searchService.opts.date).toBeDefined();
    expect(searchService.opts.date.gte).toEqual(scope.fromDate);
    expect(searchService.opts.date.lte).toEqual(scope.toDate);
  });

  describe("Tests for building elasticsearch date range query", function(){
    beforeEach(function(){
      opts = {"facets":[],"page":1,"from":'0', size: 25};
      spyOn(es, 'search');

    });

    afterEach(function(){
      /* Tear down properly so state does not persist between tests */
      delete opts.date;
      if(baseESQuery.body.date){
        delete baseESQuery.body.date;   
      }
    });

    it("builds correct elasticsearch query for date range", function(){
      opts.date = {"gte": scope.fromDate,"lte": scope.toDate};
      var dateRange = {"range":{"_date_facet":{"gte": scope.fromDate,"lte": scope.toDate}}};
      var newQuery = queryBuilder.buildSearchQuery(opts);

      var filter = newQuery.body.query.filtered.filter.bool.filter;
      expect(filter).toContain(dateRange);    
    });
  });
});