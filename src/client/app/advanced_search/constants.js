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
      },
      identifier: {
        paramName: 'adv_identifier',
        display: 'Identifier',
        searchKey: 'dublin_core.identifier'
      },
      publisher: {
        paramName: 'adv_publisher',
        display: 'Publisher',
        searchKey: 'dublin_core.publisher'
      },
      format: {
        paramName: 'adv_format',
        display: 'Format',
        searchKey: 'dublin_core.format'
      },
      type: {
        paramName: 'adv_type',
        display: 'Type',
        searchKey: 'dublin_core.type'
      },
      description: {
        paramName: 'adv_description',
        display: 'Description',
        searchKey: 'dublin_core.description'
      },
      provenance: {
        paramName: 'adv_provenance',
        display: 'Provenance',
        searchKey: 'dublin_core.provenance'
      },
      coverage: {
        paramName: 'adv_coverage',
        display: 'Coverage',
        searchKey: 'dublin_core.coverage'
      },
      relation: {
        paramName: 'adv_relation',
        display: 'Relation',
        searchKey: 'dublin_core.relation'
      },
      source: {
        paramName: 'adv_source',
        display: 'Source',
        searchKey: 'dublin_core.source'
      },
      rights: {
        paramName: 'adv_rights',
        display: 'Rights',
        searchKey: 'dublin_core.rights'
      },
      accrualMethod: {
        paramName: 'adv_accrualMethod',
        display: 'Accrual Method',
        searchKey: 'dublin_core.accrualMethod'
      },
      accrualPeriodicity: {
        paramName: 'adv_accrualPeriodicity',
        display: 'Accrual Periodicity',
        searchKey: 'dublin_core.accrualPeriodicity'
      },
      audience: {
        paramName: 'adv_audience',
        display: 'Audience',
        searchKey: 'dublin_core.audience'
      }
    });
})();
