(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['esClient', 'esQueryBuilder', '$q', '$http', DataService]);

  /* DataService - get all data through this service */
  function DataService(esClient, esQueryBuilder, $q, $http) {
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      getContributors: getContributors,
      getBookData: getBookData,
      search: search
    };

    //console.log('app.core........Returning DataService factory');
    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * Call ES for general search query. Use multi search call
     * so search query scope (filters) are not applied to aggs. See ES docs.
     * @param {object} opts search opts - see SearchService for more details.
     * @returns {promise} ES response object wrapped in a promise.
     *                    Is arr of 2 objs, 1st one query, 2nd aggs.
     */
    function search(opts){
      var mSearchQueryObj = esQueryBuilder.transformToMultiSearchQuery(
        esQueryBuilder.buildSearchQuery(opts)
      );

      //console.log('DataService::search -- mSearchQueryObj: ' + JSON.stringify(mSearchQueryObj));
      return esClient.msearch(mSearchQueryObj).then(function(response){
        var resultsObj = response.responses[0];
        resultsObj.aggregations = response.responses[1].aggregations;
        return resultsObj;
      })
      .catch(function(response){
        console.log('DataService::search -- error: ' + JSON.stringify(response));
      });
    }

    function getContributors(){
      var contributorsPromise = $http.get('http://127.0.0.1:8000/api/contributors');
      var deferred = $q.defer();
      contributorsPromise.success(function(data) {
        deferred.resolve(data);
      }).error(function() {
        deferred.reject(arguments);
      });
      return deferred.promise;
    }

    /**
     * Gets data from elasticsearch client for particular book record
     * @param bookID {string} id of record to get
     * @returns response from elasticsearch
     */
    function getBookData(bookID){
      console.log('getting book data');
      var bookPromise = $http.get('http://127.0.0.1:8000/api/book/' + bookID);
      var deferred = $q.defer();
      bookPromise.success(function (data) {
        var bookData = data._source;
        bookData._id = data._id;
        deferred.resolve(bookData);
      }).error(function () {
        deferred.reject(arguments);
      });
      return deferred.promise;
    }
  }
})();
