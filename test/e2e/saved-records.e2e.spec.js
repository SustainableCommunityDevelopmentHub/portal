// saved-records.e2e.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');
var SavedRecordsPage = require('../page_objects/saved-records.page.js');

describe('Saving Records', function() {
  var resultsPage, savedRecordsPage;


  beforeEach(function() {


    browser.executeScript(function() {
      window.localStorage.removeItem("getty_portal_records");
      window.localStorage.removeItem("getty_portal_searches");
    });

  });

  it('should display saved records on Saved Records page', function() {
    resultsPage = new ResultsPage();

    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.getAllRecords().then(function(records) {
      expect(records.length).toBe(3);
    });

    var numRecords = savedRecordsPage.getNumSavedRecords();
    expect(numRecords.getText()).toBe('3');

  });

  it('should sort records by title', function() {
    resultsPage = new ResultsPage();

    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(1);
    var titles = savedRecordsPage.getAllTitles();
    expect(titles).toEqual(titles.sort());
  });

  it('should sort records by date ascending', function() {
    resultsPage = new ResultsPage();

    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(3);
    var dates = savedRecordsPage.getAllDates();
    expect(dates).toEqual(dates.sort());
  });

  it('should sort records by date descending', function() {
    resultsPage = new ResultsPage();

    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(4);
    var dates = savedRecordsPage.getAllDates();
    expect(dates).toEqual(dates.sort().reverse());
  });

  it('should remove records from saved records page', function () {
    resultsPage = new ResultsPage();

    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickBookmark(1);
    savedRecordsPage.getAllRecords().then(function(records){
      expect(records.length).toBe(2);
    });
    expect(savedRecordsPage.getNumSavedRecords().getText()).toBe('2');

  });

  it('should sync records between tabs', function () {

  });

  it('should show recent searches', function () {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleFacetOption('subject', 'Russia');
    resultsPage.toggleFacetOption('subject', 'Catalogs');

    savedRecordsPage = new SavedRecordsPage();

    savedRecordsPage.clickRecentSearches();
    var searches = savedRecordsPage.getAllSearches();
    expect(searches.count()).toBe(3);
    expect(savedRecordsPage.getSearchTerm(0).getText()).toEqual('art');
  });


  it('should run search when clicking on search term', function () {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('art');
    resultsPage.toggleFacetOption('subject', 'Russia');
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    resultsPage.toggleFacetOption('subject', 'France');

    browser.waitForAngular();
    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickRecentSearches();
    browser.waitForAngular();
    savedRecordsPage.clickSearch(2);
    expect(resultsPage.facetChips.get(0).getText()).toEqual('art (Keyword)');
    expect(resultsPage.facetChips.get(1).getText()).toEqual('Russia (Subject)');
    expect(resultsPage.facetChips.get(2).getText()).toEqual('Catalogs (Subject)');

    resultsPage.getHits().then(function(hits) {
      expect(hits.length).toEqual(20);
    });
  });

  it('should remove searches when clicking the remove button', function () {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('art');
    resultsPage.submitNewSearchTerm('painting');
    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickRecentSearches();
    browser.waitForAngular();

    savedRecordsPage.getAllSearches().then(function(searches) {
      expect(searches.length).toBe(2);
    });
    savedRecordsPage.removeSearch(0);
    savedRecordsPage.getAllSearches().then(function(searches) {
      expect(searches.length).toBe(1);
    });
  });


});