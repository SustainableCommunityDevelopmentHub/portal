(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['$q', '$http', 'SearchService', DataService]);

  /* DataService - get all data through this service */
  function DataService($q, $http, SearchService) {
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
      var query = ["from=" + opts.from, "size=" + opts.size, "sort=" + opts.sort];
      if (opts.q.length) {
        opts.q.forEach(function(queryTerm){
          query.push("q=" + queryTerm);
        });
      }
      if (opts.date.gte) {
        query.push("date_gte=" + opts.date.gte);
      }

      if (opts.date.lte) {
        query.push("date_lte=" + opts.date.lte);
      }
      opts.facets.forEach(function(facet){
        query.push(facet.category + "=" + facet.value);
      });
      opts.advancedFields.forEach(function(advanced) {
        query.push(advanced.field.paramName + "=" + advanced.term);
      });

      var queryPath = query.join("&");
      var searchPromise = $http.get('http://127.0.0.1:8000/api/books/' + queryPath);
      var deferred = $q.defer();
      searchPromise.success(function(data) {
        var parsedData = data[0];
        parsedData.aggregations = data[1].aggregations;
        var results = SearchService.setResultsData(parsedData);
        deferred.resolve(results);
      }).error(function(response) {
        deferred.reject(arguments);
        console.log('DataService::search -- error: ' + JSON.stringify(response));
      });
      return deferred.promise;
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
