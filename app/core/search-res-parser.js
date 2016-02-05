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
     * @param {string} activeFacets Array of all active facets
     */
    function parseAggregationResults(agg, facetName, activeFacets){
      return agg.buckets.map(function(facetOption){

        var parsedOption = {
          facet: facetName,
          option: facetOption.key,
          count: facetOption.doc_count,
          active: false
        };

        // set active facets so available facets sidebar does not show them
        // validate inputs bc w/bad input application breaks, and the facet objs are brittle.
        if(activeFacets.length){
          activeFacets.forEach(function(facet){
            if(facet.facet && facet.option && parsedOption.facet && parsedOption.option){
              if(facet.facet === parsedOption.facet && facet.option === parsedOption.option){
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
