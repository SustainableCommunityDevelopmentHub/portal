(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('esQueryBuilder', [esQueryBuilder]);

  /* Functions to build various ES Queries */
  function esQueryBuilder() {
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      buildSearchQuery: buildSearchQuery,
      buildContributorsQuery: buildContributorsQuery
    };

    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * build contributors ES query obj. to get all contributors and # records each contributed.
     * @returns {object} elasticsearch query object 
     */
    function buildContributorsQuery(){
      var contribAggQuery = {
        index: 'portal',
        type: 'book',
        body: ''
      };

      contribAggQuery.body = getContributorsQuery();
      return contribAggQuery;
    }

    function buildSearchQuery(opts){
      var fullQuery = {
        index: 'portal',
        type: 'book',
        size: opts.size,
        from: opts.from,
        body: ''
      };

      fullQuery.body = getBaseQuery();

      // add q / search term if not empty string
      // else empty string, return all records
      if(opts.q && opts.q.length){
        console.log('esQueryBuilder.buildSearchQuery.......opts.q: ' + opts.q);
        fullQuery.body.query.filtered.query.match = { _all: opts.q };
      }
      else{
        fullQuery.body.query.filtered.query.match_all = {};
      }

      if(opts.sort){
        var sortMode = opts.sort.mode;
        switch(sortMode) {
          case "date_asc":
            fullQuery.body.sort = "_date_display";
            break;
          case "date_desc":
            fullQuery.body.sort = { "_date_display": {"order": "desc"}};
            break;
          case "date_added":
            fullQuery.body.sort = {"_ingest_date": {"order": "desc"}};
            break;
          case "title_asc":
            fullQuery.body.sort = "_title_display.sort";
            break;
          case "title_desc":
            fullQuery.body.sort = {"_title_display.sort": {"order": "desc"}};
            break;
        }
        console.log('esQueryBuilder.buildSearchQuery.....opts.sort:' + opts.sort);
      }

      // build filters for faceted search
      if(opts.facets.length){
        console.log('....Facet filters detected!');
        // build structure to place multiple nested filters in
        fullQuery.body.query.filtered.filter = { bool: { must: [] } };

        // container for facet categories
        // Normally we would refactor this to use FACETS. But all this logic will be moved server-side..
        var facetCategories = {
          language: {
            name: 'language',
            key: '_language',
            options:[]
          },
          subject: {
            name: 'subject',
            key: '_subject_facets.raw',
            options:[]
          },
          type: {
            name: 'type',
            key: '_grp_type.raw',
            options:[]
          },
          creator: {
            name: 'creator',
            key: '_creator_facet.raw',
            options:[]
          },
          grp_contributor: {
            name: 'grp_contributor',
            key: '_grp_contributor.raw',
            options:[]
          }
        };

        // collect facets by category
        opts.facets.forEach(function(facet){
          console.log('...Adding filter on facet: ' + JSON.stringify(facet));
          // TODO: Add validation that facet.name is valid facet category

          if(!facetCategories[facet.facet].options){
            facetCategories[facet.facet].options = [];
          }

          facetCategories[facet.facet].options.push(facet.option);
          console.log('.....facetCategories:' + JSON.stringify(facetCategories));
        });
      }

      console.log('foo');
      // add filter to query for each active facet category
      _.values(facetCategories).forEach(function(facetCategory){
        if(facetCategory.options.length){
          fullQuery.body.query.filtered
          .filter.bool.must
          .push(createFilter(facetCategory.name, facetCategory.key, facetCategory.options));
        }
      });

      console.log('esQueryBuilder.buildSearchQuery()......fullQuery:' + JSON.stringify(fullQuery));

      return fullQuery;
    }

    /**
     * build query to get information for contributors page
     * @returns {object} elasticsearch query object
     */
    function getContributorsQuery(){
      var contributorsQuery =
        {
          "aggregations": {
            "grp_contributor": {
              "terms": {
                "field": "_grp_contributor.raw",
                "size": 1000,
                "order": { "_count": "desc" }
              }
            }
          }
        };
        console.log('DataService.getContributorsQuery executed, contributorsQuery: ' + JSON.stringify(contributorsQuery));
        return _.cloneDeep(contributorsQuery);
    }

    ///////////////////////////////////
    //Private Functions
    ///////////////////////////////////

    /**
     * return copy of base ES query object.
     * this is the basic structure of all our ES queries.
     * the returned copy can then be modified as needed
     * for a particular query.
     * default query term is empty string.
     */
    function getBaseQuery(){
      // see ES documentation on 'nested' data type (related to mapping) and 'nested' terms aggregation,
      // and 'multi-fields' for more information on how the aggregations work.
      // be sure to read documentation for correct version as there were significant changes from v1.x to v2.x
      var baseQuery =
        {
          // fulltext query across all fields - the "search term"
          "query": {
            "filtered": {
              "query": {
              }
            }
          },
          // aggregations to get facet options for our query
          "aggregations": {
            "creator": {
              "terms": { "field": "_creator_facet.raw" }
            },
            "language": {
              "terms": { "field": "_language" }
            },
            "grp_contributor": {
              "terms": { "field": "_grp_contributor.raw" }
            },
            "subject": {
              "terms": { "field": "_subject_facets.raw" }
            },
            "type": {
              "terms": { "field": "_grp_type.raw" }
            }
          }
        };

        return _.cloneDeep(baseQuery);
    }



    /**
     * Construct ES query for ES terms filter.
     * Used to apply specific facet type, with one or more options, to a query.
     * Add to base query to filter on particular facet and facet options
     *
     * @returns {object} elasticsearch query DSL for terms filter
     */
    function createFilter(field, key, filterValuesArr){
      // build terms obj and wrapper, to dynamically populate w/a property
      var termsFilter =
        {
          terms: {}
        };

        // set prop on terms obj to represent field name to filter on, set arr of values to filter by.
        termsFilter.terms[key] =  filterValuesArr;
        console.log('Created Term Filter: ' + JSON.stringify(termsFilter) + ' on key: ' + key + ' for vals: ' + JSON.stringify(filterValuesArr));
        return termsFilter;
    }


  }
}());
