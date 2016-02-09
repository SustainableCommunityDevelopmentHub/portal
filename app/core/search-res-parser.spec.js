describe('SearchResParser Unit Tests', function(){
  var mockSearchRes, mockAgg, mockAggName, mockActiveFacets;

  // ensure vars are set before tests run
  // mockData comes from test/mockData.js
  beforeAll(function(){
    mockSearchRes = mockData.getMockSimpleSearchRes();

  });
  beforeEach(module('SearchResParser'));

  beforeEach(function(){
  });

  it('true is true', function(){
    expect(true).toBeTruthy();

  });

  describe('parseResults() should correctly parse result set', function(){
    it('Book items should be at top level of hits array, not in _source prop', function(){

    });

    it('Each book item should have an _id property which should be a copy of data._id from the unparsed book item', function(){
    });
  });

  describe('parseAggregationResults() should correctly parse aggregation for a single facet', function(){
    it('', function(){
    });

    it('', function(){
    });
  });
});
