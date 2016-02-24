(function() {
  'use strict';

  angular.module('app.core')
    .constant('config', {
        elastic: {
          host: 'local.portal.dev',
          port: '9200',
          apiVersion: '2.0'
        },
        app: {
          root: 'app'
        }
    })
    .constant('FACETS', {
        language: {
          name: 'language',
          key: '_language',
          options:[]
        },
        subject: {
          name: 'subject',
          key: '_subject_facets',
          rawKey: '_subject_facets.raw',
          options:[]
        },
        type: {
          name: 'type',
          key: '_grp_type',
          rawKey: '_grp_type.raw',
          options:[]
        },
        creator: {
          name: 'creator',
          key: '_creator_facet',
          rawKey: '_creator_facet.raw',
          options:[]
        },
        grp_contributor: {
          name: 'grp_contributor',
          key: '_grp_contributor',
          rawKey: '_grp_contributor.raw',
          options:[]
        }
    })
    .constant('SORT_MODES', {
        relevance : {
          display: "Relevance",
          mode: "relevance"
        },
        dateAdded : {
          display: "Newly Added First",
          mode: "date_added",
          sortQuery: {"_ingest_date": {"order": "desc"}}
        },
        titleAZ : {
          display: "Title: A-Z",
          mode: "title_asc",
          sortQuery: "_title_display.sort"
        },
        titleZA : {
          display: "Title: Z-A",
          mode: "title_desc",
          sortQuery: {"_title_display.sort": {"order": "desc"}}
        },
        dateAscend : {
          display: "Date (ascending)",
          mode: "date_asc",
          sortQuery: "_date_display"
        },
        dateDesc : {
          display: "Date (descending)",
          mode: "date_desc",
          sortQuery: { "_date_display": {"order": "desc"}}
        }
    });
})();
