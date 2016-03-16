(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SavedRecordsService', ['SAVED_ITEMS', 'DEFAULTS', 'StorageService', SavedRecordsService]);

  function SavedRecordsService(SAVED_ITEMS, DEFAULTS, StorageService){

    var service = {
      getRecords: getRecords,
      saveRecord: saveRecord,
      removeRecord: removeRecord,
      saveSearch: saveSearch,
      getSearches: getSearches,
      removeSearch: removeSearch
    };
    return service;

    /**
     * Helper function to check if two searches have matching options
     * Does not take page, sort options, page size into consideration
     * @param oldSearch {object} search to compare
     * @param newSearch {object} search to compare
     * @returns {boolean} whether searches match
     */
    function searchesMatch(oldSearch, newSearch) {
      if (oldSearch.q !== newSearch.q) {
        return false;
      }
      if (!_.isEqual(oldSearch.facets, newSearch.facets)) {
        return false;
      }
      if (!_.isEqual(oldSearch.advancedFields, newSearch.advancedFields)){
        return false;
      }
      if(!_.isEqual(oldSearch.date, newSearch.date)) {
        return false;
      }
      return true;
    };

    /**
     * Saves search if it differs from the last saved search
     * @param searchOpts {object} current search options
     * @param results {number} number of results for given search options
     */
    function saveSearch(searchOpts, results) {
      var searches = getSearches();
      var lastSearch = DEFAULTS.searchOpts;
      if (searches && searches.length > 0) {
        lastSearch = searches[searches.length - 1];
      }
      if(!searchesMatch(lastSearch, searchOpts)) {
        var newSearch = {
          q: searchOpts.q,
          facets: searchOpts.facets,
          advancedFields: searchOpts.advancedFields,
          date: searchOpts.date,
          numResults: results
        };
        saveItem(SAVED_ITEMS.searchKey, newSearch);
      }
    }

    /**
     * Get searches from storage
     * @returns {array} of search objects
     */
    function getSearches() {
      return getItems(SAVED_ITEMS.searchKey);
    }

    /**
     * Removes search object from search history
     * @param search {object} search to remove
     */
    function removeSearch(search) {
      removeItem(SAVED_ITEMS.searchKey, search);
    }

    /**
     * Convenience function for returning records
     * @returns {array} records
     */
    function getRecords() {
      return getItems(SAVED_ITEMS.recordKey);
    }

    /**
     * Convenience function for saving records.
     * @param record {object} record to save
     */
    function saveRecord(record) {
      saveItem(SAVED_ITEMS.recordKey, record);
    }

    /**
     * Convenience function for removing records
     * @param record {object} record to remove
     */
    function removeRecord(record) {
      removeItem(SAVED_ITEMS.recordKey, record);
    }

    /**
     * Get items from storage service.
     * Handles de-serializing data
     * @param type {string} type of items to get
     * @returns array of item object
     */
    function getItems(type) {
      var items = StorageService.getItems(type);
      if (items) {
        var records = JSON.parse(items);
        if(!records[type]) {
          records[type] = [];
        }
        return records[type];
      } else {
        return items;
      }
    }

    /**
     * Calls StorageService to save item.
     * Handles serializing and de-serializing of data
     * Checks if saving succeeded
     * @param type {string} type of item to save
     * @param item {object} item to save
     */
    function saveItem(type, item) {
      var savedItems = StorageService.getItems(type);
      if (savedItems) {
        savedItems = JSON.parse(savedItems);
        if(!savedItems[type]){
          savedItems[type] = [];
        }
        savedItems[type].push(item);
        var success = StorageService.setItem(type, JSON.stringify(savedItems));
        if (!success && type === SAVED_ITEMS.recordKey) {
          alert("Error: Could not save record to local storage. Please check your browser settings.");
        }
      } else if (type === SAVED_ITEMS.recordKey) {
        alert("Error: Could not save record to local storage. Please check your browser settings.");
      }
    }

    /**
     * Calls StorageService to remove item.
     * Handles serializing and deserializing data
     * @param type {string} type of item to save
     * @param item {object} item to save
     */
    function removeItem(type, item) {
      var items = StorageService.getItems(type);
      if (items) {
        items = JSON.parse(items);
        var records = items[type];
        if (records) {
          var newRecords = records.filter(function (record) {
            return record._id != item._id;
          });
          items[type] = newRecords;

        } else {
          items[type] = [];
        }
        var success = StorageService.setItem(type, JSON.stringify(items));
        if (!success && type === SAVED_ITEMS.recordKey) {
          alert("Error: Could not remove item. Please check your browser settings.");
        }
      } else {
        alert("Error: Could not remove item. Please check your browser settings.");
      }
    }

  }
})();
