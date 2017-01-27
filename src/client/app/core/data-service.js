(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('DataService', ['$q', '$http', 'config', 'SearchService', DataService]);

  /* DataService - get all data through this service */
  function DataService($q, $http, config, SearchService) {
    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      getContributors: getContributors,
      getBookData: getBookData,
      getDcRec: getDcRec,
      getRisRec: getRisRec,
      search: search
    };

    //console.log('app.core........Returning DataService factory');
    return service;

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * Call django api for general search query. Use multi search call
     * @param {object} opts search opts - see SearchService for more details.
     * @returns {promise} results data wrapped in a promise.
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
      var searchPromise = $http.get(config.django.host + ':' + config.django.port + '/api/books/' + queryPath);
      var deferred = $q.defer();

      searchPromise
        .success(function(data) {
          try {
            var parsedData = data[0];
            parsedData.aggregations = data[1].aggregations;
            var results = SearchService.setResultsData(parsedData);
            deferred.resolve(results);
          }
          catch(error) {
            console.log('DataService::search -- bad ES result -- error: ' + JSON.stringify(error));
            deferred.reject({error: 'DEFAULT', data: error});
          }

        })
        .error(function() {
          deferred.reject(arguments);
        });

      return deferred.promise;
    }

    /**
     * Gets data from django api for contributors
     * @returns promise with data from django api
     */
    function getContributors(){
      var contributorsPromise = $http.get(config.django.host + ':' + config.django.port + '/api/contributors');
      var deferred = $q.defer();
      contributorsPromise.success(function(data) {
        deferred.resolve(data);
      }).error(function() {
        deferred.reject(arguments);
      });
      return deferred.promise;
    }

    /**
     * Gets data from django api for particular book record
     * @param bookID {string} id of record to get
     * @returns promise with data from django api
     */
    function getBookData(bookID){
      return $http.get(config.django.host + ':' + config.django.port + '/api/book/raw/' + bookID);
    }

    /**
     * Gets data from django api for particular book record
     * @param bookID {string} id of record to get
     * @param format {{'' | 'json' | 'ris'} format to return record data in. null or empty string is default and should be used for book detail page info.
     * @returns promise with data from django api
     */
    function getRisRec(bookID){
      return $http.get(config.django.host + ':' + config.django.port + '/api/book/raw/' + bookID + '.ris');
    }

    function getDcRec(bookID){
      var response = $http.get(config.django.host + ':' + config.django.port + '/api/book/' + bookID);
      var deferred = $q.defer();
      response.success(function (data) {
        deferred.resolve(data);
      }).error(function() {
        deferred.reject(arguments);
      });
      return deferred.promise;
    }
  }
})();
