/* jshint node: true */
/* jshint jasmine: true */
/* global mockData, inject */
"use strict";

describe('Data Service', function() {

  var DataService, SearchService, http, mockSearchData, timeout;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_DataService_, _SearchService_, $httpBackend, $timeout){
    DataService = _DataService_;
    SearchService = _SearchService_;
    http = $httpBackend;
    timeout = $timeout;

    http.expectGET('http://127.0.0.1:8000/api/books/from=0&size=25&sort=relevance').respond({});
  }));

  beforeEach(function(done){
    timeout(done, 10);
    timeout.flush();
  });

  it('should send correct search queries and process data correctly', function(done) {
    var opts = {
      q: ['art', 'painting'],
      from: 0,
      size: 25,
      facets: [],
      date: {
        gte: '1900',
        lte: '2000'
      },
      sort: 'relevance',
      advancedFields: []
    };

    var fail = function(error) {
      expect(error).toBeUndefined();
    };

    mockSearchData = mockData.getMockComplexSearch();
    http.whenGET('http://127.0.0.1:8000/api/books/from=0&size=25&sort=relevance&q=art&q=painting&date_gte=1900&date_lte=2000').respond(mockSearchData);

    DataService.search(opts).then(function(hits) {
      var parsedMockData = mockSearchData[0];
      parsedMockData.aggregations = mockSearchData[1].aggregations;
      var mockResults = SearchService.setResultsData(parsedMockData);
      expect(hits).toEqual(mockResults);
    }).catch(fail)
      .finally(done);
    http.flush();
  });
});