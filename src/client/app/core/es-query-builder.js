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
     * @return {object} elasticsearch query object
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
              console.log('IN IF - fullQuery : ' +JSON.stringify(fullQuery));
              console.log('IN IF - aggFilter : ' +JSON.stringify(aggFilter));
              // ES throws err if aggFilter.bool.must[] is empty
              if(!aggFilter.bool || !aggFilter.bool.must){
                console.log('INNER IF - fullquery: ');
                aggFilter.bool = { must: [] };
              }

              console.log('ABOUT TO SINGELTERMS()');
              var singleTermFilters =
                createSingleTermFilters(otherFacetCategory.key, otherFacetCategory.options);

              var facetOptsFilter = createBoolShouldFilter(singleTermFilters);

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
     * @return {object} elasticsearch query object
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
     * Create a "should" bool filter which contains other filters/queries
     * @param {array} arrFilters array of filters/queries to be set in 'should[]'
     * @return {object} ES query obj containing a bool filter with should[]
     *
     */
    function createBoolShouldFilter(arrFilters){
      console.log('esQueryBuilder::createBoolShouldFilter - arg: ' + JSON.stringify(arrFilters));
      console.log('esQueryBuilder::createBoolShouldFilter - returning filter: ' + JSON.stringify(arrFilters));
      return { bool: { should: arrFilters } };
    }

    /**
     * Add a filter to a portion of a bool filter
     * @param {object} boolObj the bool obj we are adding filter to
     * @param {string} key key of the boolObj prop ('must' or 'should')
     *                     which contains the array we are pushing filter into.
     * @param {object} newFilter filter object
     *
     * @return {object} updated boolObj to allow for method chaining
     */
    function addToBool(boolObj, key, newFilter){
      boolObj[key].push(newFilter);
    }

    /**
     * Construct ES query for ES term (only one term) filter.
     * Used to add a term filter on facet aggregations...
     * ...to display correct facet options for each category
     *
     * @param {string} key name of property on ES obj we want to filter on
     * @param {array} filterVals values to filter on
     * @return {array} array of objects. each obj is elasticsearch query DSL object for a term filter
     */
    function createSingleTermFilters(key, filterVals){
      console.log('!!!!!!!!!!!!key: ' + key + ' filterVals: ' + filterVals);
      console.log('!!!!!!!!!!!!filterVals is array: ' + (filterVals instanceof Array));
      //var parsedFilterVals;
      //filterVals.forEach(function(val){
        //var filterObj = { term: {} };
        //filterObj.term[key

      //})
      var filterObjsArr = filterVals.map(function(fVal){
        console.log('!!!!!!!!!!!!!fVal: ' + fVal);
        var filterObj = { term: {} };
        filterObj.term[key] = fVal;
        console.log('!!!!!!!!!!!!!createSingleTermFilters return obj: ' + JSON.stringify(filterObj));
        return filterObj;
      });

      console.log('esQueryBuilder::createSingleTermFilters -- made: ' + JSON.stringify(filterObjsArr) + ' on key: ' + key);

      return filterObjsArr;
    }

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
          // aggregations to get facet options for our query.
          // applying individual filters on each agg for logical OR behavior within facet groups
          // and logical AND behavior between them.
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
        };

        return _.cloneDeep(baseQuery);
    }



    /**
     * Construct ES query for ES terms filter.
     * Used to apply specific facet type, with one or more options, to a query.
     * Add to base query to filter on particular facet and facet options
     *
     * @return {object} elasticsearch query DSL for terms filter
     */
    function createFilter(field, key, filterValuesArr){
      // build terms obj and wrapper, to dynamically populate w/a property
      var termsFilter = { terms: {} };

        // set prop on terms obj to represent field name to filter on, set arr of values to filter by.
        termsFilter.terms[key] = filterValuesArr;
        console.log('esQueryBuilder::createFilter -- made term filter: ' + JSON.stringify(termsFilter) + ' on key: ' + key + ' for vals: ' + JSON.stringify(filterValuesArr));
        return termsFilter;
    }

    /**
     * build sort portion of query
     * @param {string} sortMode string identifying the selected sort mode
     * @return {object} sortQuery sort portion of elasticsearch query
     */
    function buildSortQuery(sortMode){
      console.log(sortMode);
      var sortQuery;
      switch(sortMode) {
          case "date_asc":
            sortQuery = "_date_display";
            break;
          case "date_desc":
            sortQuery = { "_date_display": {"order": "desc"}};
            break;
          case "date_added":
            sortQuery = {"_ingest_date": {"order": "desc"}};
            break;
          case "title_asc":
            sortQuery = "_title_display.sort";
            break;
          case "title_desc":
            sortQuery = {"_title_display.sort": {"order": "desc"}};
            break;
        }

      console.log(sortQuery);
      return sortQuery;
    }

    /**
     * Transform the original query (with search query & aggs in same query)
     * into a multi search query.
     * TODO: Update Merge this into buildSearchQuery at a time when it won't conflict
     * with other work in progress
     * @param {object} fullQuery a query produced by esQueryBuilder::buildSearchQuery
     * @return {object} multi search query ready to be passed to esClient
     */
    function transformToMultiSearchQuery(fullQuery){
      return {
              body: [
                // search terms query
                { _index: 'portal', _type: 'book'},
                {
                  size: fullQuery.size,
                  from: fullQuery.from,
                  query: fullQuery.body.query,
                  sort: fullQuery.body.sort
                },
                // aggregations query - query here term to scope aggs to it.
                { _index: 'portal', _type: 'book'},
                {
                  size: 0,
                  query: fullQuery.body.query.filtered.query,
                  aggregations: fullQuery.body.aggregations
                }
              ]
      };
    }

  }
})();
