describe("Date Range Filter", function() {
  var scope, controller, $state, SearchService, data, opts, SavedRecordsService;

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
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_, _SearchService_, _SavedRecordsService_, DataService){
    data = DataService;
    $state = _$state_;
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    SavedRecordsService = _SavedRecordsService_;

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

  it("should reset page to 1 in when date range filter applied", function(){
    scope.clearQueryTerm();
    scope.newQuerySearch("painting");
    scope.setPageNum(2);
    expect(scope.queryTerm).toEqual("painting");
    expect(SearchService.calculatePage()).toEqual(2);

    scope.setDateRange(scope.fromDate, scope.toDate);
    expect(SearchService.calculatePage()).toEqual(1);
  });

  it("adds date range object to SearchService's options", function(){
    opts = SearchService.getDefaultOptsObj();
    scope.fromDate = 1900;
    scope.toDate = 1905;
    scope.setDateRange(scope.fromDate, scope.toDate);
    expect(SearchService.opts.date).toBeDefined();
    expect(SearchService.opts.date.gte).toEqual(scope.fromDate);
    expect(SearchService.opts.date.lte).toEqual(scope.toDate);
  });
});
