(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('esClient', ['esFactory', 'config', esClient])
    .factory('dataService', ['esClient', dataService])
    .factory('SearchService', ['dataService', SearchService]);

  /* Elasticsearch Client
  * */
  function esClient(esFactory, config) {
    return esFactory({
      host: config.elastic.host + ':' + config.elastic.port,
      apiVersion: config.elastic.apiVersion,
      log: 'trace'
    });
  };

  /* dataService - get all data through this service
  * */
  function dataService(esClient) {

    // Expose dataService functions on return object
    var service = {
      getContributors: getContributors,
      search: search,
      test: test
    };

    console.log('...RETURING DataSErvice factory');
    return service;

    // dataService functions
    function test(){
      console.log('....dataService is here!');
    };

    // Query elasticsearch
    function search(queryTerm){
      console.log('...in dataService search');
      var res = esClient.search({
        index: 'portal',
        type: 'book',
        q: queryTerm
      });
      console.log('~~~~dataService executed, promise res: ' + JSON.stringify(res));
      return res;
    };

    // Get Contributors data
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

  /* SearchService
   *
   * Run searches, access results and search query opts through this service.
   * Handles search variables, overall search state, etc.
   * Do not use dataServices directly for search.
   */
  function SearchService(dataService){
    var service = {
      results: null,
      opts: null,

      // Execute search, sets opts, results. Returns a promise.
      search: function(opts){
        console.log('.....in SearchService');
        // TODO: Naive implementation.
        // Update w/promises to make sure things work successfully and handle errs.
        this.opts = opts;
        this.results = dataService.search(opts.q);
        console.log('Executed search with opts: ' + JSON.stringify(opts));
        console.log('......................Search result promise obj: ' + JSON.stringify(this.results));
        return this.results;
      },

    };

    return service;
  };

})();
