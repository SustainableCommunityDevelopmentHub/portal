describe("Saved Records Service", function() {

  var StorageService, SavedRecordsService, testItem, recordKey, searchKey, book, testItemStr, SAVED_ITEMS;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_StorageService_, _SavedRecordsService_, _SAVED_ITEMS_) {
    StorageService = _StorageService_;
    SavedRecordsService = _SavedRecordsService_;
    SAVED_ITEMS = _SAVED_ITEMS_;
    recordKey = SAVED_ITEMS.recordKey;
    searchKey = SAVED_ITEMS.searchKey;
  }));

  describe("book records", function() {
    beforeEach(function() {
      book = {
        _date_display: "1896-05-16",
        _date_facet: "1896",
        _grp_contributor: "Gallica - Bibliothèque nationale de France",
        _grp_id: "bnf_bpt6k63442125",
        _grp_type: "Text",
        _id: "bnf_bpt6k63442125",
        _ingest_date: "2016-02-16"
      };

      testItem = {};
      testItem[SAVED_ITEMS.recordKey] = [book];

      testItemStr = JSON.stringify(testItem);
    });

    afterEach(function() {
      localStorage.removeItem(recordKey);
    });

    it('should get records from storage', function() {
      localStorage.setItem(recordKey, testItemStr);
      var records = SavedRecordsService.getRecords();
      var expectedRecords = [book];
      expect(records).toEqual(expectedRecords);
    });

    it('should return an empty list when no records in localStorage', function() {
      var records = SavedRecordsService.getRecords();
      expect(records).toEqual([]);
    });

    it('should save records correctly', function() {
      SavedRecordsService.saveRecord(book);
      var record = JSON.parse(localStorage.getItem(recordKey));
      expect(record).toEqual(testItem);
    });

    it('should remove records correctly', function(){
      localStorage.setItem(recordKey, JSON.stringify(testItem));
      SavedRecordsService.removeRecord(book);
      var item = JSON.parse(localStorage.getItem(recordKey));
      var records = item[recordKey];
      expect(records.length).toBe(0);
    });
  });

  describe("searches", function() {
    var testFacet, opts, numResults;
    beforeEach(function(){
      testFacet = {"facet":"type","option":"Text","count":249,"active":true};
      localStorage.removeItem(searchKey);
      opts = {
        q: 'art',
        facets: [testFacet]
      };
      numResults = 309;
      localStorage.removeItem(searchKey);
    });

    it('should save searches', function() {
      SavedRecordsService.saveSearch(opts, numResults);
      var searches = JSON.parse(localStorage.getItem(searchKey))[searchKey];
      expect(searches.length).toEqual(1);
      var savedSearch = searches[0];
      expect(savedSearch.q).toEqual(opts.q);
      expect(savedSearch.facets).toEqual(opts.facets);
    });

    it('should not save duplicate searches', function() {
      // Attempt to save the same search object 3 times in a row. There should be only one search object saved.
      SavedRecordsService.saveSearch(opts, numResults);
      SavedRecordsService.saveSearch(opts, numResults);
      SavedRecordsService.saveSearch(opts, numResults);
      var searches = JSON.parse(localStorage.getItem(searchKey))[searchKey];
      expect(searches.length).toEqual(1);
    });

    it('should return searches', function() {
      SavedRecordsService.saveSearch(opts, numResults);
      var searches = SavedRecordsService.getSearches();
      expect(searches.length).toEqual(1);
      var savedSearch = searches[0];
      expect(savedSearch.q).toEqual(opts.q);
      expect(savedSearch.facets).toEqual(opts.facets);
    });

    it('should remove searches', function() {
      SavedRecordsService.saveSearch(opts, numResults);
      var searches = SavedRecordsService.getSearches();
      SavedRecordsService.removeSearch(searches[0]);
      var remainingSearches = SavedRecordsService.getSearches();
      expect(remainingSearches.length).toEqual(0);
    });
  });
});