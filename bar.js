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
      transformToMultiSearchQuery: transformToMultiSearchQuery,
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

    /**
     * Build query obj for standard search query
     * @param {object} opts Search opts - see SearchService for object definition
     */
    function buildSearchQuery(opts){
      var fullQuery = {
        index: 'portal',
        type: 'book',
        size: opts.size,
        from: opts.from,
        body: ''
      };

      fullQuery.body = getBaseQuery();

      // add search term if not empty string. else return all records.
      if(opts.q && opts.q.length){
        console.log('esQueryBuilder.buildSearchQuery -- opts.q: ' + opts.q);
        fullQuery.body.query.filtered.query.match = { _all: opts.q };
      }
      else{
        fullQuery.body.query.filtered.query.match_all = {};
      }

      if(opts.sort){
        var sortQuery = buildSortQuery(opts.sort.mode);
        if(sortQuery){
          fullQuery.body.sort = sortQuery;
        }

        console.log('esQueryBuilder.buildSortQuery -- opts.sort:' + opts.sort);
      }

      // build filters for search query.
      if(opts.facets.length){
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

        // add new facets by category
        opts.facets.forEach(function(facet){
          console.log('esQueryBuilder::buildSearchQuery: adding search query filter: ' + JSON.stringify(facet));

          facetCategories[facet.facet].options.push(facet.option);
        });

        var facetCategoriesArr = _.values(facetCategories);

        // add filters to main search query
        facetCategoriesArr.forEach(function(facetCategory){
          if(facetCategory.options.length){
            fullQuery.body.query.filtered
            .filter.bool.must
            .push(createBoolShouldFilter(createSingleTermFilters(facetCategory.key, facetCategory.options)));

          }
          console.log('esQueryBuilder::buildSearchQuery -- exited facetCategoriesArr.forEach');

          var aggFilter = fullQuery.body.aggregations[facetCategory.name].filter;

          // apply filters from each other facet opt to our aggregation
          facetCategoriesArr.forEach(function(otherFacetCategory){
            console.log('esQueryBuilder::buildSearchQuery -- facetCategoriesArr.forEach() -- otherFacetCategory: ' + JSON.stringify(otherFacetCategory));
            if(otherFacetCategory.name !== facetCategory.name && otherFacetCategory.options.length){
              // ES throws err if aggFilter.bool.must[] is empty
              if(!aggFilter.bool || !aggFilterOBj.bool.must){
                aggFilter.bool = { must: [] };
              }

              //var facetOptsFilter = createBoolShouldFilter();

              var singleTermFilters =
                createSingleTermFilters(otherFacetCategory.key, otherFacetCategory.options);

                var facetOptsFilter = createBoolShouldFilter(singleTermFilters);
                //singleTermFilters.forEach(function(filter){
                //facetOptsFilter.bool.should.push(filter);
                //});

                aggFilter.bool.must.push(facetOptsFilter);
            }
          });
        });

      } // close if(facets.length)

      console.log('esQueryBuilder.buildSearchQuery() -- returning fullQuery:' + JSON.stringify(fullQuery));
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
        console.log('esQueryBuilder.getContributorsQuery executed, contributorsQuery: ' + JSON.stringify(contributorsQuery));
        return _.cloneDeep(contributorsQuery);
    }

    ///////////////////////////////////
    //Private Functions
    ///////////////////////////////////

    /**
     * Create "should" bool filter
     * @param {array} arrFilters optional array of filters (should be term filters) which can be passed
     * @returns {object} ES query obj containing a bool filter with should[]
     *
     */

  }
})();
