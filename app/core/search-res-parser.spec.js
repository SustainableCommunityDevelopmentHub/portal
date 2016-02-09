describe('SearchResParser Unit Tests', function(){
  var mockSearchHits,
      mockAgg,
      mockAggName,
      mockActiveFacets,
      mockAggArr,
      SearchResParser,
      parsedSearchHits,
      parsedAgg;

  // ensure vars are set before tests run
  // mockData comes from test/mockData.js
  // NOTE: be sure anything added here will not have state modified by tests
  // if you're not sure, add it in a beforeEach
  beforeAll(function(){
    mockSearchHits = mockData.getMockSimpleSearchRes().hits.hits;

    mockAgg = mockData.getMockAggregations().creator;
    mockAggName = 'creator';
  });

  // NOTE: Separating the module() call, injection, and use of injected service steps
  // into their own beforeEach blocks seems necessary in order to make sure each of
  // those things is loaded before the first describe block calls its tests.
  beforeEach(function(){
    module('app');
    module('app.core');
  });

  beforeEach(inject(function(_SearchResParser_){
    SearchResParser = _SearchResParser_;
  }));

  beforeEach(function(){
    parsedSearchHits = SearchResParser.parseResults(mockSearchHits);
  });

  describe('parseResults() should correctly parse hits in result set', function(){
    it('Parsed hits array should have same number of elements as unparsed array', function(){
      expect(parsedSearchHits.length).toEqual(mockSearchHits.length);
    });

    it('Book items should be at top level of hits array, not in _source prop', function(){
      var hasSourceProp;
      parsedSearchHits.forEach(function(item){
        hasSourceProp = item.hasOwnProperty('_source');
      });
      expect(hasSourceProp).toBe(false);
    });

    it('Each book item should have an _id property which should be a copy of _source._id from the unparsed book item', function(){
      var idPropsMatch;
      parsedSearchHits.forEach(function(parsedHit, index){
        idPropsMatch = (parsedHit._id === mockSearchHits[index]._source._id) ? true : false;
      });
      expect(idPropsMatch).toBe(true);
    });
  });

  describe('parseAggregationResults() should correctly parse aggregation (list of facet options) for a single facet', function(){
    beforeAll(function(){
      mockAggArr = mockAgg.buckets;
    });

    // cleanup after each test section
    afterEach(function(){
      parsedAgg = {};
      mockActiveFacets = [];
    });

    describe('when there are no active facet options', function(){
      // doing beforeAll like this to set unique options for each describe block
      beforeAll(function(){
        mockActiveFacets = [];
        parsedAgg = SearchResParser.parseAggregationResults(mockAgg, mockAggName, mockActiveFacets);
      });

      it('each option obj should have correct vals for facet, option, count, and active props', function(){

        parsedAgg.forEach(function(facetOption, index){
          expect(facetOption.facet).toBeDefined();
          expect(facetOption.option).toBeDefined();
          expect(facetOption.count).toBeDefined();
          expect(facetOption.active).toBeDefined();

          expect(facetOption.facet).toEqual(mockAggName);
          expect(facetOption.option).toEqual(mockAggArr[index].key);
          expect(facetOption.count).toEqual(mockAggArr[index].doc_count);
          expect(facetOption.active).toEqual(false);

        });
      });
    });

    describe('when there are active facet options', function(){
      var activeFacetsHelperArr;

      beforeAll(function(){
        mockActiveFacets = [
          { facet: mockAggName,
            option: "Chennevières-Pointel, Charles-Philippe de",
          },
          { facet: mockAggName,
            option: "Dussieux, Louis"
          }
        ];

        activeFacetsHelperArr = ["Chennevières-Pointel, Charles-Philippe de", "Dussieux, Louis"];

        parsedAgg = SearchResParser.parseAggregationResults(mockAgg, mockAggName, mockActiveFacets);
      });

      it('each option obj should have correct vals for facet, option, count, and active props', function(){
        parsedAgg.forEach(function(facetOption, index){
          expect(facetOption.facet).toBeDefined();
          expect(facetOption.option).toBeDefined();
          expect(facetOption.count).toBeDefined();
          expect(facetOption.active).toBeDefined();

          expect(facetOption.facet).toEqual(mockAggName);
          expect(facetOption.option).toEqual(mockAggArr[index].key);
          expect(facetOption.count).toEqual(mockAggArr[index].doc_count);

          if(activeFacetsHelperArr.indexOf(facetOption.option) > -1){
            console.log('Facet option: ' + facetOption.option);
            console.log('....the OBJECT: ' + JSON.stringify(facetOption));
            expect(facetOption.active).toEqual(true);
          }
          else{
            expect(facetOption.active).toEqual(false);
          }
        });

      });

      afterAll(function(){
        parsedAgg = {};
        mockActiveFacets = [];
      });

    });
  });
});
