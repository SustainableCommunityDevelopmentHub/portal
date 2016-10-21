(function() {
  'use strict';

  angular.module('app.advanced-search')
    .constant('ADVANCED_SEARCH', {
      title: {
        paramName: 'adv_title',
        display: 'Title'
      },
      creator: {
        paramName: 'adv_creator',
        display: 'Creator'
      },
      date: {
        paramName: 'adv_date',
        display: 'Date'
      },
      language: {
        paramName: 'adv_language',
        display: 'Language'
      },
      subject: {
        paramName: 'adv_subject',
        display: 'Subject'
      },
      grp_contributor: {
        paramName: 'adv_grp_contributor',
        display: 'From'
      },
      keyword: {
        paramName: 'adv_keyword',
        display: 'Keyword'
      },
      identifier: {
        paramName: 'adv_identifier',
        display: 'Identifier'
      },
      publisher: {
        paramName: 'adv_publisher',
        display: 'Publisher'
      },
      format: {
        paramName: 'adv_format',
        display: 'Format'
      },
      type: {
        paramName: 'adv_type',
        display: 'Type'
      },
      description: {
        paramName: 'adv_description',
        display: 'Description'
      },
      provenance: {
        paramName: 'adv_provenance',
        display: 'Provenance'
      },
      coverage: {
        paramName: 'adv_coverage',
        display: 'Coverage'
      },
      relation: {
        paramName: 'adv_relation',
        display: 'Relation'
      },
      source: {
        paramName: 'adv_source',
        display: 'Source'
      },
      rights: {
        paramName: 'adv_rights',
        display: 'Rights'
      },
      accrualMethod: {
        paramName: 'adv_accrualMethod',
        display: 'Accrual Method'
      },
      accrualPeriodicity: {
        paramName: 'adv_accrualPeriodicity',
        display: 'Accrual Periodicity'
      },
      audience: {
        paramName: 'adv_audience',
        display: 'Audience'
      }
    });
})();
