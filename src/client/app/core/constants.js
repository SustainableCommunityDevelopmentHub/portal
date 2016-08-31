(function() {
  'use strict';

  angular.module('app.core')
    .constant('FACETS', {
        language: {
          name: 'language',
          key: '_language',
          display: 'Language',
          options:[]
        },
        subject: {
          name: 'subject',
          key: '_subject_facets',
          rawKey: '_subject_facets.raw',
          display: 'Subject',
          options:[]
        },
        creator: {
          name: 'creator',
          key: '_creator_facet',
          rawKey: '_creator_facet.raw',
          display: 'Creator/Contributor',
          options:[]
        },
        grp_contributor: {
          name: 'grp_contributor',
          key: '_grp_contributor',
          rawKey: '_grp_contributor.raw',
          display: 'From',
          options:[]
        }
    })
    .constant('SORT_MODES', {
        relevance : {
          display: "Relevance",
          mode: "relevance"
        },
        date_added : {
          display: "Newly Added First",
          mode: "date_added",
          sortQuery: {"_ingest_date": {"order": "desc"}}
        },
        title_asc : {
          display: "Title: A-Z",
          mode: "title_asc",
          sortQuery: "_title_display.sort"
        },
        title_desc : {
          display: "Title: Z-A",
          mode: "title_desc",
          sortQuery: {"_title_display.sort": {"order": "desc"}}
        },
        date_asc : {
          display: "Date (ascending)",
          mode: "date_asc",
          sortQuery: "_date_facet"
        },
        date_desc : {
          display: "Date (descending)",
          mode: "date_desc",
          sortQuery: { "_date_facet": {"order": "desc"}}
        }
    })
    .constant('SAVED_ITEMS', {
      recordKey: "getty_portal_records",
      searchKey: "getty_portal_searches",
      gettyID: "getty_portal"
    })
    .constant('FROM_DEFAULT', 0)
    .constant('SIZE_DEFAULT', 25)
    .constant('SORT_DEFAULT', 'relevance')
    .constant('DEFAULTS', {
      searchOpts: {
        q: [],
        size: 25,
        from: 0,
        facets: [],
        advancedFields: [],
        sort: 'relevance',
        date: {}
      }
    });
})();
