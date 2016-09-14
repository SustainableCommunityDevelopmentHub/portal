(function() {
  'use strict';

  angular.module('app.advanced-search')
    .constant('ADVANCED_SEARCH', {
      title: {
        paramName: 'adv_title',
        display: 'Title',
        searchKey: 'dublin_core.title'
      },
      creator: {
        paramName: 'adv_creator',
        display: 'Creator',
        searchKey: 'dublin_core.creator'
      },
      date: {
        paramName: 'adv_date',
        display: 'Date',
        searchKey: 'dublin_core.date'
      },
      language: {
        paramName: 'adv_language',
        display: 'Language',
        searchKey: 'dublin_core.language'
      },
      subject: {
        paramName: 'adv_subject',
        display: 'Subject',
        searchKey: 'dublin_core.subject'
      },
      grp_contributor: {
        paramName: 'adv_grp_contributor',
        display: 'From',
        searchKey: '_grp_contributor'
      },
      keyword: {
        paramName: 'adv_keyword',
        display: 'Keyword',
        searchKey: 'keyword'
      }
    });
})();
