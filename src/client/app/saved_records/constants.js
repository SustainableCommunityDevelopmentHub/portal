(function() {
  'use strict';
  angular.module('app.saved-records')
    .constant('SAVED_RECORDS_SORT', {
      dateAdded : {
        display: "Newly Added First",
        mode: "date_added"
      },
      titleAZ : {
        display: "Title: A-Z",
        mode: "title_asc"
      },
      titleZA : {
        display: "Title: Z-A",
        mode: "title_desc"
      },
      dateAscend : {
        display: "Date (ascending)",
        mode: "date_asc"
      },
      dateDesc : {
        display: "Date (descending)",
        mode: "date_desc"
      }});
})();
