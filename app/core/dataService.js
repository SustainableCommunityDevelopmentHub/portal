(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('dataService', ['esClient', dataService])

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
    function search(opts){
      console.log('...in dataService search');
      // build query obj
      var query = opts;
      query.index = 'portal';
      query.type = 'book';
      // execute query return promise
      var res = esClient.search(query);
      console.log('DataService..... executed, promise res: ' + JSON.stringify(res));
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

})();
