describe("Saved Records Service", function() {

  var StorageService, SavedRecordsService, testItem, recordKey, searchKey, book, testItemStr, SAVED;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_StorageService_, _SavedRecordsService_, SAVED_ITEMS) {
    StorageService = _StorageService_;
    SavedRecordsService = _SavedRecordsService_;
    SAVED = SAVED_ITEMS;
  }));

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
    recordKey = "saved_records";
    searchKey = "saved_searches";
    testItem = {};
    testItem[recordKey] = [book];

    testItemStr = JSON.stringify(testItem);
  });

  afterEach(function() {
    localStorage.removeItem(recordKey);
  });

  it('should get records from storage', function() {
    localStorage.setItem(recordKey, testItemStr)
    var records = SavedRecordsService.getItems(recordKey);
    var expectedRecords = [book];
    expect(records).toEqual(expectedRecords);
  });

  it('should return an empty list when no records in localStorage', function() {
    var records = SavedRecordsService.getItems(recordKey);
    expect(records).toEqual([]);
  });

  it('should save records correctly', function() {
    SavedRecordsService.saveItem(recordKey, book);
    var record = JSON.parse(localStorage.getItem(recordKey));
    expect(record).toEqual(testItem);
  });

  it('should remove records correctly', function(){
    localStorage.setItem(recordKey, JSON.stringify(testItem));
    SavedRecordsService.removeItem(recordKey, book);
    var item = JSON.parse(localStorage.getItem(recordKey));
    var records = item[recordKey];
    expect(records.length).toBe(0);
  });


});