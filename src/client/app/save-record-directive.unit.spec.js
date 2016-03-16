describe("Save Record Button Directive", function() {
  var elem, scope, $compile, book, SAVED_ITEMS;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
  });

  beforeEach(module('templates'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _SAVED_ITEMS_) {
    scope = _$rootScope_;
    $compile = _$compile_;
    SAVED_ITEMS = _SAVED_ITEMS_;
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
  });

  beforeEach(function(){
    elem = angular.element('<save-record-button></save-record-button>');
    $compile(elem)(scope);
    scope.$digest();
  });

  afterEach(function(){
    localStorage.removeItem(SAVED_ITEMS.recordKey);
    localStorage.removeItem(SAVED_ITEMS.searchKey);
  });

  it('should save book record correctly', function() {

    scope.toggleSavingBook(book);
    expect(scope.savedRecords).toContain(book);
    var records = JSON.parse(localStorage.getItem(SAVED_ITEMS.recordKey))[SAVED_ITEMS.recordKey];
    expect(records).toContain(book);
  });

  it('should remove book record correctly', function() {
    var item = {};
    item[SAVED_ITEMS.recordKey] = [book];
    localStorage.setItem(SAVED_ITEMS.recordKey, JSON.stringify(item));
    scope.savedRecords = [book];
    scope.toggleSavingBook(book);

    var returnedItem = JSON.parse(localStorage.getItem(SAVED_ITEMS.recordKey));
    var books = returnedItem[SAVED_ITEMS.recordKey];
    expect(books.length).toBe(0);
    expect(scope.savedRecords.length).toBe(0);

  });

  it('should detect if book record is saved', function() {
    scope.toggleSavingBook(book);
    expect(scope.isRecordSaved(book)).toBe(true);
  });

  it('should detect if book record is not saved', function() {
    //should be false since local storage was cleared before this ran
    expect(scope.isRecordSaved(book)).toBe(false);
  });

  it('should set properties correctly when mouse hovers over bookmark', function() {
    scope.toggleSavingBook(book);
    scope.saveRecordHover(book);
    expect(scope.bookMarkText).toEqual("Remove Record");

    scope.toggleSavingBook(book);
    scope.saveRecordHover(book);
    expect(scope.bookMarkText).toEqual("Save Record");
  });
});