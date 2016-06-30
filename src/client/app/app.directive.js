(function() {
  'use strict';

  angular
    .module('app')
    .directive('saveRecordButton', ['$state', 'SavedRecordsService', 'SAVED_ITEMS', function($state, SavedRecordsService, SAVED_ITEMS){
      return {
        restrict: 'AE',
        replace: 'true',
        scope: false,
        templateUrl: 'app/partials/save-record-button.html',
        link: function (scope, elem, attrs) {

          /**
           * Saves book record using SavedRecordsService and updates savedRecords
           * @param book {object} record to save
           */
          function saveRecord (book) {
            SavedRecordsService.saveRecord(book);
            var records = SavedRecordsService.getRecords();
            if (records) {
              scope.savedRecords = records;
            } else {
              scope.savedRecords = [];
            }
          }

          /**
           * Removes book record from storage
           * @param book {object} record to remove
           */
          function removeRecord (book) {
            SavedRecordsService.removeRecord(book);
            scope.savedRecords = SavedRecordsService.getRecords();
            if($state.current.controller === 'SavedRecordsCtrl'){
              scope.refresh();
            }
          };

          /**
           * Checks if book record is saved in storage
           * @param book {object} book to check
           * @returns {boolean} whether book is saved
           */
          scope.isRecordSaved = function(book) {
            var savedRecords = SavedRecordsService.getRecords();
            if (savedRecords) {
              for (var i = 0; i < savedRecords.length; i++) {
                var current = savedRecords[i];
                if (current._id === book._id) {
                  return true;
                }
              }
              return false;
            } else {
              return false;
            }
          };

          /**
           * Sets appropriate variables when your mouse hovers over bookmark icon
           * @param book {object} record bookmark is referencing
           */
          scope.saveRecordHover = function(book){
            this.showBookmarkText = true;
            if (scope.isRecordSaved(book)) {
              scope.bookMarkText = "Remove Record";
            } else {
              scope.bookMarkText = "Save Record";
            }
          };

          /**
           * Sets appropriate variables when your mouse stops hovering over bookmark icon
           */
          scope.saveRecordHoverOut = function() {
            this.showBookmarkText = false;
          };

          /**
           * Toggles the saving and removing book record from storage
           * @param book {object} book record to be saved
           */
          scope.toggleSavingBook = function(book) {
            if (scope.isRecordSaved(book)) {
              removeRecord(book);
              scope.bookMarkText = "Save Record";
            } else {
              saveRecord(book);
              scope.bookMarkText = "Remove Record";
            }
          };
        }
      };
    }])
    .directive('storageEventListener', ['$state', 'SavedRecordsService', 'SAVED_ITEMS', function($state, SavedRecordsService, SAVED_ITEMS) {
      return {
        restrict: 'AE',
        template: '',
        link: function (scope, elem, attrs) {

          //Watch for storage events
          angular.element(window).on('storage', function(event) {
            if (event.key === SAVED_ITEMS.recordKey) {
              if($state.current.controller === 'SavedRecordsCtrl'){
                scope.refresh();
              }
              scope.$apply();
            }
          });
        }
      };
    }
    ])
    .directive('noHoverMobile', function() {
      return function(scope, elem, attr){
        $(document).ready(function() {

          $('a').on('touchend', function(e) {
            var el = $(this);
            var link = el.attr('href');
            window.location = link;
          });
        });
      };
    })
    .directive('removeClick', function() {
      return function(scope, elem, attr){
        $(document).ready(function() {
          $(this).on('touch', function(e) {
            $(this).unbind('click').click();
          });
        });
      };
    });
})();