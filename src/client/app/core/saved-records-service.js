(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('SavedRecordsService', ['$q', 'SAVED_ITEMS', 'StorageService', SavedRecordsService]);

  function SavedRecordsService($q, SAVED_ITEMS, StorageService){

    var service = {
      getRecords: getRecords,
      saveRecord: saveRecord,
      removeRecord: removeRecord,
      saveSearch: saveSearch,
      getSearches: getSearches,
      removeSearch: removeSearch,
      removeItem: removeItem,
      saveItem: saveItem,
      getItems: getItems
    }
    return service;

    var record = SAVED_ITEMS.recordKey;
    var search = SAVED_ITEMS.searchKey

    function saveSearch(searchOpts, numResults) {
      var search = {
        opts: searchOpts,
        num: numResults
      };
      saveItem(SAVED_ITEMS.searchKey, search);
    }

    function getSearches() {
      return getItems(SAVED_ITEMS.searchKey);
    }

    function removeSearch(search) {
      removeItem(SAVED_ITEMS.searchKey, search);
    }

    function getRecords() {
      return getItems(SAVED_ITEMS.recordKey);
    }

    function saveRecord(record) {
      saveItem(SAVED_ITEMS.recordKey, record);
    }

    function removeRecord(record) {
      removeItem(SAVED_ITEMS.recordKey, record);
    }


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

    function saveItem(type, item) {
      var savedItems = StorageService.getItems(type)
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
      } else {
        alert("Error: Could not save record to local storage. Please check your browser settings.");
      }
    }

    function removeItem(type, item) {
      var items = StorageService.getItems(type);
      if (items) {
        items = JSON.parse(items);
        var records = items[type];
        var newRecords = records.filter(function (record) {
          return record._id != item._id;
        });
        items[type] = newRecords;
        var success = StorageService.setItem(type, JSON.stringify(items));
        if (!success) {
          alert("Error: Could not remove item. Please check your browser settings.");
        }
      } else {
        alert("Error: Could not remove item. Please check your browser settings.");
      }
    }

  }
})();