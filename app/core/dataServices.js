/* dataServices.js
 * All data should be gotten through this service */

(function() {
  'use strict';

  angular
    .module('portalServices')
    .factory('dataService', ['esClient', dataServices]);

function dataServices(esClient) {

  /* Expose dataService functions on return object */
  var dataService = {
    search: search,
    test: test
  };

  return dataService;


  /* dataService functions */
  function test(){
    console.log('....dataService is here!');
  };

  // Query elasticsearch
  function search(queryTerm){
    return esClient.search({
      index: 'portal',
      type: 'book',
      q: queryTerm
    });
  };

};

})();
