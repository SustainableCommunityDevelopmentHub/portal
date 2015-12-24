(function() {
  'use strict';

  angular.module('app.search')
    .constant('FacetList', [
      { key: 'type',
        title: 'Type',
      },
      { key: 'creator',
        title: 'Creator'
      },
      { key: 'subject',
        title: 'Subject'
      },
      { key: 'language',
        title: 'Language'
      },
      { key: 'date',
        title: 'Date'
      },
      { key: 'grp_contributing_institution',
        title: 'Contributing Institution'
      }
    ]);
})();
