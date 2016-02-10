(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['esClient', 'esQueryBuilder', 'FACETS', DataService]);

  /* DataService - get all data through this service */
  function DataService(esClient, esQueryBuilder, FACETS) {
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      getContributors: getContributors,
      search: search
    };

    console.log('Core........Returning DataService factory');
    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * Call ES for general query
     */
    function search(opts){
      var response = esClient.search(
        esQueryBuilder.buildSearchQuery(opts)
      );

      console.log('DataService.search..... executed, promise response: ' + JSON.stringify(response));
      return response;
    }

    function getContributors(){
      var response = esClient.search(
        esQueryBuilder.buildContributorsQuery()
      );

      console.log('DataService.getContributors..... executed, promise response: ' + JSON.stringify(response));
      return response;
    }

  }
})();
