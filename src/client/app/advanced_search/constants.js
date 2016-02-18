(function() {
  'use strict';
  
  angular.module('app.advanced-search')
    .constant('ADVANCED_SEARCH', {
      contributor: {
        display: 'Contributed by',
        searchKey: '_grp_contributor'
      },
      creator: {
        display: 'Creator',
        searchKey: '_creator_facet'
      },
      date: {
        display: 'Date',
        searchKey: '_date_display'
      },
      language: {
        display: 'Language',
        searchKey: '_language.advanced'
      },
      subject: {
        display: 'Subject',
        searchKey: '_subject_facets'
      },
      type: {
        display: 'Type',
        searchKey: '_grp_type.advanced'
      }
    });
})();