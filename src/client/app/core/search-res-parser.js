(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('SearchResParser', ['_', 'FACETS', SearchResParser]);

  /* SearchResParser
   *
   * Parse search results to make easier for client app to work with
   */
  function SearchResParser(_, FACETS){

    /////////////////////////////////
    // Expose Service
    /////////////////////////////////
    var service = {
      // functions //
      parseResults: parseResults,
      parseAggregationResults: parseAggregationResults
    };

    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * parse search result hits data to simplify object structure
     * @param {array} hits from ES response obj. contains search results (hits returned)
     */
    function parseResults(hits){
      return hits.map(function(data){
        var book = data._source;
        // _id represents ES id. Thus if an 'id' field is ever added it won't get overwritten
        book._id = data._id;
        return book;
      });

    }

    /**
     * Parse search result aggregation data for a single aggregation
     * to simplify object struction.
     * Also add a bool property to allow facet to be activated
     * @param {object} agg Aggregation object in field from ES response obj. Contains aggregation for a facet.
     * @param {string} facetName Facet option name
     * @param {array} activeFacets Array of objects of all active facets.
     * Each object must have a 'category' prop (facet category) and an 'value' prop (value)
     */
    function parseAggregationResults(agg, facetName, activeFacets){
      console.log('....activeFacets:::: ' + activeFacets);
      return agg.buckets.map(function(facetOption){

        var parsedOption = {
          category: facetName,
          value: facetOption.key,
          count: facetOption.doc_count,
          active: false
        };

        // set active facets so available facets sidebar does not show them
        // validate inputs bc w/bad input application breaks, and the facet objs are brittle.
        // effectively we are requiring a specific object structure for activeFacets objs for facet activation.
        if(activeFacets.length){
          activeFacets.forEach(function(facet){
            if(facet.category && facet.value && parsedOption.category && parsedOption.value){
              if(facet.category === parsedOption.category && facet.value === parsedOption.value){
                parsedOption.active = true;
              }
            }
          });
        }

        return parsedOption;
      });
    }

  }
})();
