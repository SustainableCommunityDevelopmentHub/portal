describe("Date Range Filter", function() {
  var scope, controller, $state, SearchService, data, es, opts, queryBuilder, SavedRecordsService;

  var baseESQuery = {
    "index":"portal",
    "type":"book",
    "size":25,
    "from":"0",
    "body":{
      "query":{
        "bool": {
          "must": {
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
      "aggregations": {
        "creator": {
          "filter": { },
          "aggs": {
            "creator": {
              "terms": { "field": "_creator_facet.raw", "size": 1000 }
            }
          }
        },
        "language": {
          "filter": { },
          "aggs": {
            "language": {
              "terms": { "field": "_language", "size": 1000 }
            }
          }
        },
        "grp_contributor": {
          "filter": { },
          "aggs": {
            "grp_contributor": {
              "terms": { "field": "_grp_contributor.raw", "size": 1000 }
            }
          }
        },
        "subject": {
          "filter": { },
          "aggs": {
            "subject": {
              "terms": { "field": "_subject_facets.raw", "size": 1000 }
            }
          }
        },
        "type": {
          "filter": { },
          "aggs": {
            "type": {
              "terms": { "field": "_grp_type.raw", "size": 1000 }
            }
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
  
  beforeEach(inject(function($rootScope, $controller, _$state_, _SearchService_, _SavedRecordsService_, DataService, esClient, esQueryBuilder){
    data = DataService;
    es = esClient;
    $state = _$state_;
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    SavedRecordsService = _SavedRecordsService_;
    queryBuilder = esQueryBuilder;

    controller = $controller('SearchCtrl', {
        '$scope': scope,
        '$state': $state,
        'SearchService': SearchService,
        'SavedRecordsService': SavedRecordsService,
        'searchResults': {
          hits: [],
          numTotalResults: 0,
          facets: []
        }
      });
    }));

  it("should call Search Service's update opts when calling setDateRange", function(){
    spyOn(SearchService, 'updateOpts');
    scope.setDateRange(scope.fromDate, scope.toDate);
    expect(SearchService.updateOpts).toHaveBeenCalled();
  });

  describe("Tests for building elasticsearch date range query", function(){
    beforeEach(function(){
      opts = {"facets":[],"page":1,"from":'0', size: 25};
      scope.fromDate = "1900";
      scope.toDate = "1905";
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

      var filter = newQuery.body.query.bool.filter.bool.filter;
      expect(filter).toContain(dateRange);    
    });

    it("adds date range object to SearchService's options", function(){
      scope.setDateRange(scope.fromDate, scope.toDate);
      expect(SearchService.opts.date).toBeDefined();
      expect(SearchService.opts.date.gte).toEqual(scope.fromDate);
      expect(SearchService.opts.date.lte).toEqual(scope.toDate);
    });
  });
});