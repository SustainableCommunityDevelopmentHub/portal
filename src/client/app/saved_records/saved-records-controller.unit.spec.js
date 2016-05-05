describe("Saved Records Controller", function(){
  var scope, state, SearchService, controller, SavedRecordsService, SAVED_RECORDS_SORT;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('app.core');
    module('app');
    module('app.saved-records');
  });

  beforeEach(inject(function($rootScope, $controller, _$state_, _SavedRecordsService_, _SearchService_, _SAVED_RECORDS_SORT_) {
    state = _$state_;
    SavedRecordsService = _SavedRecordsService_;
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    SAVED_RECORDS_SORT = _SAVED_RECORDS_SORT_;
    controller = $controller('SavedRecordsCtrl', {
      '$scope': scope,
      '$state': state,
      'records': [],
      'searches': [],
      'SavedRecordService': SavedRecordsService,
      'SearchService': SearchService,
      'SAVED_RECORDS_SORT': SAVED_RECORDS_SORT
    });
  }));

  beforeEach(function() {
    localStorage.removeItem("getty_portal_searches");
  });

  it('should run searches', function() {
    var search = {
      opts: {
        q: "art",
        facets: [],
        advancedFields: []
      },
      numResults: 309,
      time: 1458758924936
    };

    spyOn(SearchService, 'updateOpts');
    spyOn(SearchService, 'executeSearch');
    scope.runSearch(search);
    expect(SearchService.updateOpts).toHaveBeenCalled();
    expect(SearchService.executeSearch).toHaveBeenCalled();
  });

  it('should remove searches correctly', function() {
    var search = {
      opts: {
        q: "art",
        facets: [],
        advancedFields: []
      },
      numResults: 309,
      time: 1458758924936
    };

    SavedRecordsService.saveSearch(search.opts, search.numResults, search.time);
    scope.savedSearches = SavedRecordsService.getSearches();
    expect(scope.savedSearches.length).toEqual(1);
    scope.removeSearch(search);
    expect(scope.savedSearches.length).toEqual(0);
  });

  it('should sort by title', function() {
    var book1 = {
      _title_display: "England and the Englishman in German literature of the eighteenth century, John Alexander Kelly."
    };
    var book2 = {
      _title_display: "Catalogue of the portraits, miniatures, &c., at Castle Howard / by Lord Hawkesbury."
    };
    var book3 = {
      _title_display: "Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase."
    };

    scope.savedRecords = [book1, book2, book3];
    var titles = [book1._title_display, book2._title_display, book3._title_display];
    titles.sort();

    scope.sortRecords(SAVED_RECORDS_SORT.titleAZ);
    expect(scope.savedRecords).toEqual([book2, book1, book3]);

    expect(scope.currentSort).toEqual(SAVED_RECORDS_SORT.titleAZ.display);
    expect(scope.currentPage).toEqual(1);

    scope.sortRecords(SAVED_RECORDS_SORT.titleZA);
    expect(scope.savedRecords).toEqual([book3, book1, book2]);
  });

  it('should sort by date', function() {
    var book1 = {
      _date_facet: '1900'
    };
    var book2 = {
      _date_facet: '1620'
    };
    var book3 = {
      _date_facet: '1605'
    };

    scope.savedRecords = [book1, book2, book3];

    scope.sortRecords(SAVED_RECORDS_SORT.dateAscend);
    expect(scope.savedRecords.length).toBe(3);
    expect(scope.savedRecords).toEqual([book3, book2, book1]);

    scope.sortRecords(SAVED_RECORDS_SORT.dateDesc);
    expect(scope.savedRecords).toEqual([book1, book2, book3]);

  });

  it('should set active tabs correctly', function() {
    scope.setActiveTab('searches');
    expect(scope.recordsActive).toBe(false);
    expect(scope.searchesActive).toBe(true);

    scope.setActiveTab('records');
    expect(scope.recordsActive).toBe(true);
    expect(scope.searchesActive).toBe(false);
  });

});
