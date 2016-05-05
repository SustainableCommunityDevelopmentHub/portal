(function() {
  'use strict';
  
  angular.module('app.advanced-search')
    .constant('ADVANCED_SEARCH', {
      title: {
        display: 'Title',
        searchKey: 'dublin_core.title'
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
      contributor: {
        display: 'From',
        searchKey: '_grp_contributor'
      },
    });
})();