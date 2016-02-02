(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['esClient', 'FACETS', DataService])

  /* DataService - get all data through this service */
  function DataService(esClient, FACETS) {
    var service = {
      getContributors: getContributors,
      search: search
    };

    console.log('Core........Returning DataService factory');
    return service;

    /**
     * General Elasticsearch query function
     */
    function search(opts){
      // build full ES query obj
      var fullQuery = {
        index: 'portal',
        type: 'book',
        size: opts.size,
        from: opts.from,
        body: getBaseQuery()
      };

      // add q / search term if not empty string
      // else empty string, return all records
      if(opts.q && opts.q.length){
        console.log('DataService.search.......opts.q: ' + opts.q);
        fullQuery.body.query.filtered.query.match = { _all: opts.q };
      }
      else{
        fullQuery.body.query.filtered.query.match_all = {};
      }

      if(opts.sort){
        var sortMode = opts.sort.mode
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
      console.log('DataService.search.....opts.sort:' + opts.sort);      
      }

      // build filters for faceted search
      if(opts.facets.length){
        console.log('....Facet filters detected!');
        // build structure to place multiple nested filters in
        fullQuery.body.query.filtered.filter = { bool: { must: [] } };

        // container for facet categories
        // TODO: build facetCategories from FACETS, to make app more DRY
        //var facetCategories = _.clone(FACETS);
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

          // this is here as a hack for when we will use FACETS, which doesn't have options[], to generate facetCategories
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

      console.log('Dataservice.search()......fullQuery:' + JSON.stringify(fullQuery));

      // execute query return promise
      var res = esClient.search(fullQuery);

      console.log('DataService.search..... executed, promise res: ' + JSON.stringify(res));
      return res;

      ////////////////////////////
      //Private/Helper Functions
      ////////////////////////////

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
      };

      /**
       * Return copy of base ES query object.
       * This is the basic structure of all our ES queries.
       * The returned copy can then be modified as needed
       * for a particular query.
       * Default query term is empty string.
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
    };

  };

    /**
     * Get Contributors information
     */
    function getContributors(){
      var contributors = [
        {name:'Gallica Bibliotheque Nationale de France', num_records: '27,274'},
        {name:'Getty Research Institute', num_records: '27,274'},
        {name:'Heidelberg University Library', num_records: '15,873'},
        {name:'Institut National d\'Histoire de l\'Art', num_records: '5,377'},
        {name:'Metropolitan Museum of Art', num_records: '4,647'},
        {name:'Smithsonian Libraries', num_records: '2,991'},
        {name:'Library of the Philadelphia Museum of Art', num_records: '1,726'},
        {name:'Avery Architectural & Fine Arts Library at Columbia University', num_records: '1,425'},
        {name:'Sterling and Francine Clark Art Institute Library', num_records: '335'},
        {name:'Frick Art Reference Library', num_records: '284'},
        {name:'Getty Publications Virtual Library', num_records: '236'},
        {name:'Brooklyn Museum Libraries and Archives', num_records: '122'},
        {name:'National Gallery of Canada Library and Archives', num_records: '36'},
        {name:'Kunsthistorisches Institut in Florenz', num_records: '35'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'},
        {name:'Universidad de Malaga', num_records: '25'},
        {name:'Online Scholarly Catalogue Initiative', num_records: '10'}
      ];
      return contributors;
    };
  };

})();
