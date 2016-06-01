(function() {
  /* jshint validthis: true */
  'use strict';

  angular
  .module('app.core')
  .factory('esQueryBuilder', ['DEFAULTS', 'SORT_MODES', '_', esQueryBuilder]);

  /* Functions to build various ES Queries */
  function esQueryBuilder(DEFAULTS, SORT_MODES, _) {
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      globalFilters: [],
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

      var _this = this;

      contribAggQuery.body = getContributorsQuery();
      return contribAggQuery;
    }

    /**
     * Build query obj for standard search query
     * @param {object} opts Search opts - see SearchService for object definition
     */
    function buildSearchQuery(opts){
      // set defaults
      opts.size = opts.size || DEFAULTS.searchOpts.size;
      opts.from = opts.from || DEFAULTS.searchOpts.from;

      var fullQuery = {
        index: 'portal',
        type: 'book',
        size: opts.size,
        from: opts.from,
        body: ''
      };
      this.globalFilters = [];

      fullQuery.body = getBaseQuery();

      // add search term if not empty string. else return all records.
      if(opts.q && opts.q.length){
        //console.log('esQueryBuilder.buildSearchQuery -- opts.q: ' + opts.q);
        console.log(opts.q.join(" "));
        fullQuery.body.query.bool.must =
          {
            query_string: {
              query: opts.q.join(" "),
              minimum_should_match: '2<-1 5<75%',
              fields: [
                '_record_link',
                '_language',
                '_language.folded',
                '_grp_type',
                '_title_display^18',
                '_title_display.folded^18',
                '_subject_facets^15',
                '_subject_facets.folded^15',
                '_creator_display',
                '_creator_display.folded',
                '_creator_facet^12',
                '_creator_facet.folded^12',
                '_date_facet.folded',
                '_date_display',
                '_date_display.folded',
                '_grp_contributor',
                '_grp_contributor.folded',
                '_grp_id',
                '_edition',
                '_edition.folded',
                '_series',
                '_series.folded',
                'dublin_core.identifier.value',
                'dublin_core.identifier.value.folded',
                'dublin_core.creator.value',
                'dublin_core.creator.value.folded',
                'dublin_core.date.value',
                'dublin_core.date.value.folded',
                'dublin_core.publisher.value',
                'dublin_core.publisher.value.folded',
                'dublin_core.format.value',
                'dublin_core.format.value.folded',
                'dublin_core.type.value',
                'dublin_core.type.value.folded',
                'dublin_core.description.value',
                'dublin_core.description.value.folded',
                'dublin_core.provenance.value',
                'dublin_core.provenance.value.folded',
                'dublin_core.language.value',
                'dublin_core.language.value.folded',
                'dublin_core.subject.value',
                'dublin_core.subject.value.folded',
                'dublin_core.coverage.value',
                'dublin_core.coverage.value.folded',
                'dublin_core.title.value',
                'dublin_core.title.value.folded',
                'dublin_core.contributor.value',
                'dublin_core.contributor.value.folded',
                'dublin_core.relation.value',
                'dublin_core.relation.value.folded',
                'dublin_core.source.value',
                'dublin_core.source.value.folded',
                'dublin_core.rights.value',
                'dublin_core.rights.value.folded',
                'dublin_core.accrualMethod.value',
                'dublin_core.accrualMethod.value.folded',
                'dublin_core.accrualPeriodicity.value',
                'dublin_core.accrualPeriodicity.value.folded',
                'dublin_core.audience.value',
                'dublin_core.audience.value.folded'
              ]
            }
          };
      }
      else{
        fullQuery.body.query.bool.must.match_all = {};
      }

      if(opts.sort){
        var sortQuery = SORT_MODES[opts.sort].sortQuery;
        if(sortQuery){
          fullQuery.body.sort = sortQuery;
        }

        //console.log('esQueryBuilder -- opts.sort:' + opts.sort);
      }

      if(opts.date){
        var dateRange = buildDateRangeQuery(opts.date.gte, opts.date.lte);
        if(dateRange) {
          fullQuery.body.query.bool
          .filter.bool.filter
          .push(dateRange);
          this.globalFilters.push(dateRange);
        }
      }

      /**
       * If there are filters from advanced search in opts, create filter objects.
       * Then add them to the query object
       */
      if (opts.advancedFields && opts.advancedFields.length) {
        var allAdvancedFilters = [];
        opts.advancedFields.forEach(function(item){

          if (item.field.searchKey.substr(0, 11) === "dublin_core" && item.field.searchKey !== 'dublin_core.date') {
            var query = {
              query_string: {
                query: item.term,
                minimum_should_match: '2<-1 5<75%',
                fields: [item.field.searchKey + '.value', item.field.searchKey + '.value.folded']
              }
            };
            fullQuery.body.query.bool.filter.bool.filter.push(query);
            allAdvancedFilters.push(query);
          }
          else if (item.field.searchKey === 'dublin_core.date') {
            var query = {
              query_string: {
                query: item.term,
                minimum_should_match: '2<-1 5<75%',
                fields: ['_date_facet.folded', item.field.searchKey + '.value', item.field.searchKey + '.value.folded']
              }
            };
            fullQuery.body.query.bool.filter.bool.filter.push(query);
            allAdvancedFilters.push(query);
          }
          else {
            var query = {
              query_string: {
                query: item.term,
                minimum_should_match: '2<-1 5<75%',
                fields: [item.field.searchKey, item.field.searchKey + '.folded']
              }
            };
            fullQuery.body.query.bool.filter.bool.filter.push(query);
            allAdvancedFilters.push(query);
          }
        });
        if(allAdvancedFilters.length > 0){
          this.globalFilters.push(allAdvancedFilters);
        }
      }

      // build filters for search query.
      if(opts.facets && opts.facets.length){
        // container for facet categories
        // Normally we would refactor this to use FACETS. But all this logic will be moved server-side..
        var facetCategories = {
          language: {
            name: 'language',
            key: '_language',
            values:[]
          },
          subject: {
            name: 'subject',
            key: '_subject_facets.raw',
            values:[]
          },
          type: {
            name: 'type',
            key: '_grp_type.raw',
            values:[]
          },
          creator: {
            name: 'creator',
            key: '_creator_facet.raw',
            values:[]
          },
          grp_contributor: {
            name: 'grp_contributor',
            key: '_grp_contributor.raw',
            values:[]
          }
        };

        // add new facets by category
        opts.facets.forEach(function(facet){
          //console.log('esQueryBuilder::buildSearchQuery: adding search query filter: ' + JSON.stringify(facet));
          facetCategories[facet.category].values.push(facet.value);
        });

        var facetCategoriesArr = _.values(facetCategories);

        // add filters to main search query
        facetCategoriesArr.forEach(function(facetCategory){
          if(facetCategory.values.length){
            fullQuery.body.query.bool
            .filter.bool.must
            .push(createBoolShouldFilter(createSingleTermFilters(facetCategory.key, facetCategory.values)));

          }
          //console.log('esQueryBuilder::buildSearchQuery -- exited facetCategoriesArr.forEach');

          var aggFilter = fullQuery.body.aggregations[facetCategory.name].filter;

          // apply filters from each other facet opt to our aggregation
          facetCategoriesArr.forEach(function(otherFacetCategory){
            //console.log('esQueryBuilder::buildSearchQuery -- facetCategoriesArr.forEach() -- otherFacetCategory: ' + JSON.stringify(otherFacetCategory));
            if(otherFacetCategory.name !== facetCategory.name && otherFacetCategory.values.length){
              // ES throws err if aggFilter.bool.must[] is empty
              if(!aggFilter.bool || !aggFilter.bool.must){
                aggFilter.bool = { must: [] };
              }

              var singleTermFilters =
                createSingleTermFilters(otherFacetCategory.key, otherFacetCategory.values);

              var facetOptsFilter = createBoolShouldFilter(singleTermFilters);

              aggFilter.bool.must.push(facetOptsFilter);
            }
          });
        });

      } // close if(facets.length)

      //console.log('esQueryBuilder.buildSearchQuery() -- returning fullQuery:' + JSON.stringify(fullQuery));
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
        //console.log('esQueryBuilder.getContributorsQuery executed, contributorsQuery: ' + JSON.stringify(contributorsQuery));
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
      //console.log('esQueryBuilder::createBoolShouldFilter - arg: ' + JSON.stringify(arrFilters));
      //console.log('esQueryBuilder::createBoolShouldFilter - returning filter: ' + JSON.stringify(arrFilters));
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
     * ...to display correct facet values for each category
     *
     * @param {string} key name of property on ES obj we want to filter on
     * @param {array} filterVals values to filter on
     * @return {array} array of objects. each obj is elasticsearch query DSL object for a term filter
     */
    function createSingleTermFilters(key, filterVals){
      //var parsedFilterVals;
      //filterVals.forEach(function(val){
        //var filterObj = { term: {} };
        //filterObj.term[key

      //})
      var filterObjsArr = filterVals.map(function(fVal){
        var filterObj = { term: {} };
        filterObj.term[key] = fVal;
        return filterObj;
      });

      //console.log('esQueryBuilder::createSingleTermFilters -- made: ' + JSON.stringify(filterObjsArr) + ' on key: ' + key);

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
            "bool": {
              "must": {
              },
              "filter": {
                "bool": {
                  "must": [],
                  "filter": []
                }
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
     * Used to apply specific facet type, with one or more values, to a query.
     * Add to base query to filter on particular facet and facet values
     *
     * @return {object} elasticsearch query DSL for terms filter
     */
    function createFilter(field, key, filterValuesArr){
      // build terms obj and wrapper, to dynamically populate w/a property
      var termsFilter = { terms: {} };

        // set prop on terms obj to represent field name to filter on, set arr of values to filter by.
        termsFilter.terms[key] = filterValuesArr;
        //console.log('esQueryBuilder::createFilter -- made term filter: ' + JSON.stringify(termsFilter) + ' on key: ' + key + ' for vals: ' + JSON.stringify(filterValuesArr));
        return termsFilter;
    }

    function buildDateRangeQuery(fromDate, toDate) {
      if (fromDate || toDate) {
        var dateRangeFilter =
        {
          "range" : {
            "_date_facet" : {
              "gte" : fromDate,
              "lte" : toDate
            }
          }
        };
        return dateRangeFilter;
      }
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
                  query: {
                    bool: {
                      must: fullQuery.body.query.bool.must,
                      filter: {
                        bool: {
                          must: this.globalFilters
                        }
                      }
                    }
                  },
                  aggregations: fullQuery.body.aggregations
                }
              ]
      };
    }
  }
})();
