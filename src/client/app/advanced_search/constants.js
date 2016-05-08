(function() {
  'use strict';

  angular.module('app.advanced-search')
    .constant('ADVANCED_SEARCH', {
      title: {
        name: 'title',
        display: 'Title',
        searchKey: 'dublin_core.title'
      },
      creator: {
        name: 'creator',
        display: 'Creator',
        searchKey: 'dublin_core.creator'
      },
      date: {
        name: 'date',
        display: 'Date',
        searchKey: 'dublin_core.date'
      },
      language: {
        name: 'language',
        display: 'Language',
        searchKey: 'dublin_core.language'
      },
      subject: {
        name: 'subject',
        display: 'Subject',
        searchKey: 'dublin_core.subject'
      },
      contributor: {
        name: 'grp_contributor',
        display: 'From',
        searchKey: '_grp_contributor'
      },
    });
})();
