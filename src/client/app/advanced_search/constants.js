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
        searchKey: 'dublin_core.creator'
      },
      date: {
        display: 'Date',
        searchKey: 'dublin_core.date'
      },
      language: {
        display: 'Language',
        searchKey: 'dublin_core.language'
      },
      subject: {
        display: 'Subject',
        searchKey: 'dublin_core.subject'
      },
      title: {
        display: 'Title',
        searchKey: 'dublin_core.title'
      },
      type: {
        display: 'Type',
        searchKey: 'dublin_core.type'
      }
    });
})();