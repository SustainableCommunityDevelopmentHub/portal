(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['esClient', DataService])

  /* DataService - get all data through this service */
  function DataService(esClient) {
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
      if(opts.q && opts.q.length){
        console.log('DataService.search.......opts.q: ' + opts.q);
        fullQuery.body.query.match._all = opts.q;
      }
      // else empty string, return all records
      else{
        delete fullQuery.body.query.match._all;
        fullQuery.body.query.match_all = {};
      }

      console.log('Dataservice.search()......fullQuery:' + JSON.stringify(fullQuery));

      // execute query return promise
      var res = esClient.search(fullQuery);

      console.log('DataService.search..... executed, promise res: ' + JSON.stringify(res));
      return res;

      ////////////////////////////
      //Private/Helper Functions
      ////////////////////////////

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
              "match": { "_all": "" }
            },
            // aggregations to get facet options for our query
            "aggregations": {
              // creator
              "creator": {
                "nested": {
                  "path": "creator"
                },
                "aggs": {
                  "creator": {
                    "terms": {
                      "field": "creator.value.raw"
                    }
                  }
                }
              },
              // language
              "language": {
                "nested": {
                  "path": "language"
                },
                "aggs": {
                  "language": {
                    "terms": {
                      "field": "language.value"
                    }
                  }
                }
              },
              // contributing institution
              "grp_contributing_institution": {
                "nested": {
                  "path": "grp_contributing_institution"
                },
                "aggs": {
                  "creator": {
                    "terms": {
                      "field": "grp_contributing_institution.raw"
                    }
                  }
                }
              },
              // subject
              "subject": {
                "nested": {
                  "path": "subject"
                },
                "aggs": {
                  "subject": {
                    "terms": {
                      "field": "subject.value.raw"
                    }
                  }
                }
              },
              // type
              "type": {
                "nested": {
                  "path": "type"
                },
                "aggs": {
                  "type": {
                    "terms": {
                      "field": "type.value.raw"
                    }
                  }
                }
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
