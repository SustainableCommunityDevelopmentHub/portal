(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('StorageService', ['$q', 'SAVED_ITEMS', StorageService]);

  function StorageService(SAVED_ITEMS){

    var service = {
      getItems: getItems,
      setItem: setItem
    }

    return service;

    /**
     * Get items from local storage
     * @param key {string} item to get
     * @returns {boolean} item or false if failure
     */
    function getItems(key){
      try {
        var item = localStorage.getItem(key);
      } catch(e) {
        return false;
      }
      if(item) {
        return item;
      } else {
        console.log("Creating: " + key);
        var newItem = {};
        var itemAsString = JSON.stringify(newItem);
        try {
          localStorage.setItem(key, itemAsString);
          return itemAsString;
        } catch(e) {
          return false;
        }
      }
    }

    /**
     * Set item in local storage
     * @param key {string} key for the item
     * @param item {string} item to store
     * @returns {boolean} whether setting item succeeded
     */
    function setItem(key, item){
      try {
        localStorage.setItem(key, item);
        return true;
      } catch(e) {
        return false;
      }
    }
  }
})();
